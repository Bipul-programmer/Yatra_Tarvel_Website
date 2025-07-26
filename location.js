const express = require('express');
const { body, query, validationResult } = require('express-validator');
const axios = require('axios');
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

// Update user location
router.put('/update', auth, [
  body('latitude').isFloat().withMessage('Valid latitude is required'),
  body('longitude').isFloat().withMessage('Valid longitude is required'),
  body('address').optional().isString().withMessage('Address must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude, address } = req.body;

    // Update user location
    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        currentLocation: {
          latitude,
          longitude,
          address,
          lastUpdated: new Date()
        }
      },
      { new: true }
    ).select('-password');

    res.json({
      message: 'Location updated successfully',
      currentLocation: user.currentLocation
    });
  } catch (error) {
    console.error('Location update error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nearby places using Google Places API
router.get('/nearby-places', auth, [
  query('type').optional().isString().withMessage('Type must be a string'),
  query('radius').optional().isFloat().withMessage('Radius must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { type = 'tourist_attraction', radius = 5000 } = req.query;
    const { latitude, longitude } = req.user.currentLocation || {};

    if (!latitude || !longitude) {
      return res.status(400).json({ message: 'User location not available' });
    }

    const googleMapsApiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!googleMapsApiKey) {
      return res.status(500).json({ message: 'Google Places API key not configured' });
    }

    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=${type}&key=${googleMapsApiKey}`;

    const response = await axios.get(url);
    const places = response.data.results || [];

    // Format places data
    const formattedPlaces = places.map(place => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      types: place.types,
      photos: place.photos ? place.photos.slice(0, 3) : [],
      geometry: place.geometry,
      openingHours: place.opening_hours,
      priceLevel: place.price_level
    }));

    res.json({
      places: formattedPlaces,
      location: { latitude, longitude }
    });
  } catch (error) {
    console.error('Nearby places error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get place details
router.get('/place/:placeId', auth, async (req, res) => {
  try {
    const { placeId } = req.params;
    const googleMapsApiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!googleMapsApiKey) {
      return res.status(500).json({ message: 'Google Places API key not configured' });
    }

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,reviews,photos,opening_hours,price_level,geometry&key=${googleMapsApiKey}`;

    const response = await axios.get(url);
    const placeDetails = response.data.result;

    if (!placeDetails) {
      return res.status(404).json({ message: 'Place not found' });
    }

    res.json(placeDetails);
  } catch (error) {
    console.error('Place details error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get directions between two points
router.get('/directions', auth, [
  query('origin').notEmpty().withMessage('Origin is required'),
  query('destination').notEmpty().withMessage('Destination is required'),
  query('mode').optional().isIn(['driving', 'walking', 'bicycling', 'transit']).withMessage('Invalid travel mode')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { origin, destination, mode = 'driving' } = req.query;
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!googleMapsApiKey) {
      return res.status(500).json({ message: 'Google Maps API key not configured' });
    }

    const url = `https://maps.googleapis.com/maps/api/directions/json?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&mode=${mode}&key=${googleMapsApiKey}`;

    const response = await axios.get(url);
    const directions = response.data;

    if (directions.status !== 'OK') {
      return res.status(400).json({ message: 'Could not find directions' });
    }

    res.json(directions);
  } catch (error) {
    console.error('Directions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current location address (reverse geocoding)
router.get('/address/:latitude/:longitude', async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    const googleMapsApiKey = process.env.GOOGLE_MAPS_API_KEY;

    if (!googleMapsApiKey) {
      return res.status(500).json({ message: 'Google Maps API key not configured' });
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsApiKey}`;

    const response = await axios.get(url);
    const results = response.data.results;

    if (!results || results.length === 0) {
      return res.status(404).json({ message: 'Address not found' });
    }

    const address = results[0].formatted_address;
    const addressComponents = results[0].address_components;

    res.json({
      address,
      addressComponents,
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    });
  } catch (error) {
    console.error('Address lookup error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get popular tourist attractions
router.get('/attractions', auth, [
  query('latitude').isFloat().withMessage('Latitude must be a number'),
  query('longitude').isFloat().withMessage('Longitude must be a number'),
  query('radius').optional().isFloat().withMessage('Radius must be a number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { latitude, longitude, radius = 10000 } = req.query;
    const googleMapsApiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!googleMapsApiKey) {
      return res.status(500).json({ message: 'Google Places API key not configured' });
    }

    // Get tourist attractions
    const attractionsUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=tourist_attraction&rankby=rating&key=${googleMapsApiKey}`;
    
    // Get restaurants
    const restaurantsUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${latitude},${longitude}&radius=${radius}&type=restaurant&rankby=rating&key=${googleMapsApiKey}`;

    const [attractionsResponse, restaurantsResponse] = await Promise.all([
      axios.get(attractionsUrl),
      axios.get(restaurantsUrl)
    ]);

    const attractions = attractionsResponse.data.results || [];
    const restaurants = restaurantsResponse.data.results || [];

    // Combine and format results
    const allPlaces = [...attractions, ...restaurants].map(place => ({
      id: place.place_id,
      name: place.name,
      address: place.vicinity,
      rating: place.rating,
      userRatingsTotal: place.user_ratings_total,
      types: place.types,
      photos: place.photos ? place.photos.slice(0, 2) : [],
      geometry: place.geometry,
      priceLevel: place.price_level,
      category: place.types.includes('tourist_attraction') ? 'attraction' : 'restaurant'
    }));

    // Sort by rating
    allPlaces.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    res.json({
      places: allPlaces.slice(0, 20), // Return top 20
      location: { latitude: parseFloat(latitude), longitude: parseFloat(longitude) }
    });
  } catch (error) {
    console.error('Attractions error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 