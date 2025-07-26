const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Vehicle = require('../models/Vehicle');
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

// Get all vehicles with filters
router.get('/', [
  query('type').optional().isString().withMessage('Type must be a string'),
  query('minPrice').optional().isFloat().withMessage('Min price must be a number'),
  query('maxPrice').optional().isFloat().withMessage('Max price must be a number'),
  query('brand').optional().isString().withMessage('Brand must be a string'),
  query('transmission').optional().isString().withMessage('Transmission must be a string'),
  query('fuelType').optional().isString().withMessage('Fuel type must be a string'),
  query('latitude').optional().isFloat().withMessage('Latitude must be a number'),
  query('longitude').optional().isFloat().withMessage('Longitude must be a number'),
  query('radius').optional().isFloat().withMessage('Radius must be a number'),
  query('seats').optional().isInt().withMessage('Seats must be an integer')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      type,
      minPrice,
      maxPrice,
      brand,
      transmission,
      fuelType,
      latitude,
      longitude,
      radius = 50000, // Default 50km radius
      seats,
      page = 1,
      limit = 10
    } = req.query;

    const filter = { isAvailable: true };

    // Type filter
    if (type) {
      filter.type = type;
    }

    // Price filter
    if (minPrice || maxPrice) {
      filter.pricePerDay = {};
      if (minPrice) filter.pricePerDay.$gte = parseFloat(minPrice);
      if (maxPrice) filter.pricePerDay.$lte = parseFloat(maxPrice);
    }

    // Brand filter
    if (brand) {
      filter.brand = { $regex: brand, $options: 'i' };
    }

    // Transmission filter
    if (transmission) {
      filter.transmission = transmission;
    }

    // Fuel type filter
    if (fuelType) {
      filter.fuelType = fuelType;
    }

    // Seats filter
    if (seats) {
      filter.seats = { $gte: parseInt(seats) };
    }

    // Location-based filter
    if (latitude && longitude) {
      filter['location.coordinates'] = {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius)
        }
      };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const vehicles = await Vehicle.find(filter)
      .populate('owner', 'name email phone')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ averageRating: -1, pricePerDay: 1 });

    const total = await Vehicle.countDocuments(filter);

    res.json({
      vehicles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + vehicles.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Vehicle search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vehicle by ID
router.get('/:id', async (req, res) => {
  try {
    const vehicle = await Vehicle.findById(req.params.id)
      .populate('owner', 'name email phone')
      .populate('reviews.user', 'name');

    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    res.json(vehicle);
  } catch (error) {
    console.error('Vehicle fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add vehicle review
router.post('/:id/reviews', auth, [
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').isLength({ min: 10 }).withMessage('Comment must be at least 10 characters long')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { rating, comment } = req.body;
    const vehicleId = req.params.id;

    const vehicle = await Vehicle.findById(vehicleId);
    if (!vehicle) {
      return res.status(404).json({ message: 'Vehicle not found' });
    }

    // Check if user already reviewed this vehicle
    const existingReview = vehicle.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this vehicle' });
    }

    // Add review
    vehicle.reviews.push({
      user: req.user._id,
      rating: parseFloat(rating),
      comment
    });

    // Update average rating
    const totalRating = vehicle.reviews.reduce((sum, review) => sum + review.rating, 0);
    vehicle.averageRating = totalRating / vehicle.reviews.length;

    await vehicle.save();

    res.json({
      message: 'Review added successfully',
      vehicle
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nearby vehicles
router.get('/nearby/:latitude/:longitude', [
  query('radius').optional().isFloat().withMessage('Radius must be a number')
], async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    const radius = req.query.radius || 10000; // Default 10km

    const vehicles = await Vehicle.find({
      isAvailable: true,
      'location.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius)
        }
      }
    })
    .populate('owner', 'name email phone')
    .limit(20);

    res.json(vehicles);
  } catch (error) {
    console.error('Nearby vehicles error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search vehicles by name or brand
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const vehicles = await Vehicle.find({
      isAvailable: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { model: { $regex: query, $options: 'i' } },
        { 'location.city': { $regex: query, $options: 'i' } }
      ]
    })
    .populate('owner', 'name email phone')
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ averageRating: -1 });

    const total = await Vehicle.countDocuments({
      isAvailable: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { brand: { $regex: query, $options: 'i' } },
        { model: { $regex: query, $options: 'i' } },
        { 'location.city': { $regex: query, $options: 'i' } }
      ]
    });

    res.json({
      vehicles,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + vehicles.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Vehicle search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vehicle types
router.get('/types/list', async (req, res) => {
  try {
    const types = await Vehicle.distinct('type');
    res.json(types);
  } catch (error) {
    console.error('Vehicle types error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get vehicle brands
router.get('/brands/list', async (req, res) => {
  try {
    const brands = await Vehicle.distinct('brand');
    res.json(brands);
  } catch (error) {
    console.error('Vehicle brands error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 