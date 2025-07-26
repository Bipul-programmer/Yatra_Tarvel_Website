const express = require('express');
const { body, query, validationResult } = require('express-validator');
const axios = require('axios');
const SafetyZone = require('../models/SafetyZone');
const User = require('../models/User');

const router = express.Router();

// Middleware to verify JWT token
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId);
    
    if (!user) {
      return res.status(401).json({ message: 'Invalid token.' });
    }

    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: 'Invalid token.' });
  }
};

// Check location safety
router.get('/check/:latitude/:longitude', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    const radius = req.query.radius || 1000; // Default 1km radius

    // Check for safety zones in the area
    const safetyZones = await SafetyZone.find({
      isActive: true,
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius)
        }
      }
    }).sort({ riskLevel: -1 });

    // Get emergency contacts using Google Places API
    const emergencyContacts = await getEmergencyContacts(latitude, longitude);

    // Determine safety status
    let isSafe = true;
    let riskLevel = 'Low';
    let warnings = [];

    if (safetyZones.length > 0) {
      const highRiskZones = safetyZones.filter(zone => 
        zone.riskLevel === 'High' || zone.riskLevel === 'Critical'
      );

      if (highRiskZones.length > 0) {
        isSafe = false;
        riskLevel = highRiskZones[0].riskLevel;
        warnings = highRiskZones.map(zone => ({
          name: zone.name,
          description: zone.description,
          riskLevel: zone.riskLevel,
          reasons: zone.reasons
        }));
      }
    }

    // Update user safety status
    await User.findByIdAndUpdate(req.user._id, { isSafe });

    res.json({
      isSafe,
      riskLevel,
      warnings,
      safetyZones: safetyZones.map(zone => ({
        id: zone._id,
        name: zone.name,
        type: zone.type,
        riskLevel: zone.riskLevel,
        description: zone.description,
        distance: calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          zone.coordinates.latitude,
          zone.coordinates.longitude
        )
      })),
      emergencyContacts,
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    });
  } catch (error) {
    console.error('Safety check error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get safe alternatives
router.get('/safe-alternatives/:latitude/:longitude', auth, async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    const radius = req.query.radius || 10000; // Default 10km radius

    // Find safe zones in the area
    const safeZones = await SafetyZone.find({
      isActive: true,
      type: 'Safe',
      coordinates: {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius)
        }
      }
    }).limit(10);

    // Get nearby safe places using Google Places API
    const googleMapsApiKey = process.env.GOOGLE_PLACES_API_KEY;
    let safePlaces = [];

    if (googleMapsApiKey) {
      try {
        // Search for police stations, hospitals, and safe public places
        const policeUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=police&key=${googleMapsApiKey}`;
        const hospitalUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=hospital&key=${googleMapsApiKey}`;
        const hotelUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=lodging&key=${googleMapsApiKey}`;

        const [policeResponse, hospitalResponse, hotelResponse] = await Promise.all([
          axios.get(policeUrl),
          axios.get(hospitalUrl),
          axios.get(hotelUrl)
        ]);

        const policeStations = policeResponse.data.results || [];
        const hospitals = hospitalResponse.data.results || [];
        const hotels = hotelResponse.data.results || [];

        safePlaces = [...policeStations, ...hospitals, ...hotels].map(place => ({
          id: place.place_id,
          name: place.name,
          address: place.vicinity,
          type: place.types.includes('police') ? 'police' : 
                place.types.includes('hospital') ? 'hospital' : 'hotel',
          rating: place.rating,
          geometry: place.geometry,
          distance: calculateDistance(
            parseFloat(latitude),
            parseFloat(longitude),
            place.geometry.location.lat,
            place.geometry.location.lng
          )
        }));

        // Sort by distance
        safePlaces.sort((a, b) => a.distance - b.distance);
      } catch (error) {
        console.error('Google Places API error:', error);
      }
    }

    res.json({
      safeZones: safeZones.map(zone => ({
        id: zone._id,
        name: zone.name,
        description: zone.description,
        coordinates: zone.coordinates,
        distance: calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          zone.coordinates.latitude,
          zone.coordinates.longitude
        )
      })),
      safePlaces: safePlaces.slice(0, 15), // Return top 15
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    });
  } catch (error) {
    console.error('Safe alternatives error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Report unsafe location
router.post('/report', auth, [
  body('latitude').isFloat().withMessage('Valid latitude is required'),
  body('longitude').isFloat().withMessage('Valid longitude is required'),
  body('name').isLength({ min: 3 }).withMessage('Name must be at least 3 characters long'),
  body('description').isLength({ min: 10 }).withMessage('Description must be at least 10 characters long'),
  body('riskLevel').isIn(['Low', 'Medium', 'High', 'Critical']).withMessage('Invalid risk level'),
  body('reasons').isArray().withMessage('Reasons must be an array')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude, name, description, riskLevel, reasons } = req.body;

    // Create a new safety zone for the reported unsafe location
    const safetyZone = new SafetyZone({
      name,
      description,
      type: 'Unsafe',
      riskLevel,
      reasons,
      coordinates: {
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude)
      },
      reportedBy: req.user._id,
      isActive: true,
      createdAt: new Date()
    });

    await safetyZone.save();

    res.json({ 
      message: 'Unsafe location reported successfully',
      safetyZone: {
        id: safetyZone._id,
        name: safetyZone.name,
        description: safetyZone.description,
        riskLevel: safetyZone.riskLevel,
        reasons: safetyZone.reasons,
        coordinates: safetyZone.coordinates,
        reportedAt: safetyZone.createdAt
      }
    });
  } catch (error) {
    console.error('Report unsafe location error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get reported unsafe locations
router.get('/unsafe-locations', auth, async (req, res) => {
  try {
    const { latitude, longitude, radius = 5000 } = req.query; // Default 5km radius

    let query = {
      type: 'Unsafe',
      isActive: true
    };

    // If coordinates provided, filter by distance
    if (latitude && longitude) {
      query.coordinates = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius)
        }
      };
    }

    const unsafeLocations = await SafetyZone.find(query)
      .populate('reportedBy', 'firstName lastName')
      .sort({ createdAt: -1 })
      .limit(50); // Limit to 50 most recent reports

    const formattedLocations = unsafeLocations.map(location => ({
      id: location._id,
      name: location.name,
      description: location.description,
      riskLevel: location.riskLevel,
      reasons: location.reasons,
      latitude: location.coordinates.latitude,
      longitude: location.coordinates.longitude,
      radius: location.radius || 300, // Default 300m radius for red zone
      reportedAt: location.createdAt,
      reportedBy: location.reportedBy ? 
        `${location.reportedBy.firstName} ${location.reportedBy.lastName}` : 
        'Anonymous',
      distance: latitude && longitude ? 
        calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          location.coordinates.latitude,
          location.coordinates.longitude
        ) : null
    }));

    res.json({
      unsafeLocations: formattedLocations,
      total: formattedLocations.length
    });
  } catch (error) {
    console.error('Get unsafe locations error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get all safety zones (admin endpoint)
router.get('/zones', auth, async (req, res) => {
  try {
    const zones = await SafetyZone.find({ isActive: true })
      .populate('reportedBy', 'firstName lastName')
      .sort({ createdAt: -1 });

    res.json({
      zones: zones.map(zone => ({
        id: zone._id,
        name: zone.name,
        description: zone.description,
        type: zone.type,
        riskLevel: zone.riskLevel,
        reasons: zone.reasons,
        coordinates: zone.coordinates,
        reportedBy: zone.reportedBy ? 
          `${zone.reportedBy.firstName} ${zone.reportedBy.lastName}` : 
          'System',
        createdAt: zone.createdAt,
        isActive: zone.isActive
      }))
    });
  } catch (error) {
    console.error('Get safety zones error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get emergency contacts
router.get('/emergency-contacts/:latitude/:longitude', async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    const emergencyContacts = await getEmergencyContacts(latitude, longitude);

    res.json(emergencyContacts);
  } catch (error) {
    console.error('Emergency contacts error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get safety statistics
router.get('/statistics', auth, async (req, res) => {
  try {
    const totalReports = await SafetyZone.countDocuments();
    const activeReports = await SafetyZone.countDocuments({ isActive: true });
    const highRiskReports = await SafetyZone.countDocuments({ 
      isActive: true, 
      riskLevel: { $in: ['High', 'Critical'] } 
    });

    const recentReports = await SafetyZone.find({ isActive: true })
      .sort({ lastUpdated: -1 })
      .limit(5)
      .populate('reportedBy', 'name');

    res.json({
      totalReports,
      activeReports,
      highRiskReports,
      recentReports
    });
  } catch (error) {
    console.error('Safety statistics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Helper function to get emergency contacts
async function getEmergencyContacts(latitude, longitude) {
  const googleMapsApiKey = process.env.GOOGLE_PLACES_API_KEY;
  
  if (!googleMapsApiKey) {
    return {
      police: null,
      hospital: null,
      fireStation: null
    };
  }

  try {
    // Get police stations
    const policeUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=police&key=${googleMapsApiKey}`;
    const hospitalUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=hospital&key=${googleMapsApiKey}`;
    const fireUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=5000&type=fire_station&key=${googleMapsApiKey}`;

    const [policeResponse, hospitalResponse, fireResponse] = await Promise.all([
      axios.get(policeUrl),
      axios.get(hospitalUrl),
      axios.get(fireUrl)
    ]);

    const policeStations = policeResponse.data.results || [];
    const hospitals = hospitalResponse.data.results || [];
    const fireStations = fireResponse.data.results || [];

    return {
      police: policeStations.length > 0 ? {
        name: policeStations[0].name,
        address: policeStations[0].vicinity,
        distance: calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          policeStations[0].geometry.location.lat,
          policeStations[0].geometry.location.lng
        )
      } : null,
      hospital: hospitals.length > 0 ? {
        name: hospitals[0].name,
        address: hospitals[0].vicinity,
        distance: calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          hospitals[0].geometry.location.lat,
          hospitals[0].geometry.location.lng
        )
      } : null,
      fireStation: fireStations.length > 0 ? {
        name: fireStations[0].name,
        address: fireStations[0].vicinity,
        distance: calculateDistance(
          parseFloat(latitude),
          parseFloat(longitude),
          fireStations[0].geometry.location.lat,
          fireStations[0].geometry.location.lng
        )
      } : null
    };
  } catch (error) {
    console.error('Emergency contacts API error:', error);
    return {
      police: null,
      hospital: null,
      fireStation: null
    };
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in kilometers
  return Math.round(distance * 1000); // Return distance in meters
}

module.exports = router; 