const express = require('express');
const { body, query, validationResult } = require('express-validator');
const Hotel = require('../models/Hotel');
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

// Get all hotels with filters
router.get('/', [
  query('minPrice').optional().isFloat().withMessage('Min price must be a number'),
  query('maxPrice').optional().isFloat().withMessage('Max price must be a number'),
  query('rating').optional().isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  query('amenities').optional().isString().withMessage('Amenities must be a string'),
  query('latitude').optional().isFloat().withMessage('Latitude must be a number'),
  query('longitude').optional().isFloat().withMessage('Longitude must be a number'),
  query('radius').optional().isFloat().withMessage('Radius must be a number'),
  query('city').optional().isString().withMessage('City must be a string')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const {
      minPrice,
      maxPrice,
      rating,
      amenities,
      latitude,
      longitude,
      radius = 50000, // Default 50km radius
      city,
      page = 1,
      limit = 10
    } = req.query;

    const filter = { isActive: true };

    // Price filter
    if (minPrice || maxPrice) {
      filter['priceRange.min'] = {};
      if (minPrice) filter['priceRange.min'].$gte = parseFloat(minPrice);
      if (maxPrice) filter['priceRange.max'].$lte = parseFloat(maxPrice);
    }

    // Rating filter
    if (rating) {
      filter.rating = { $gte: parseFloat(rating) };
    }

    // Amenities filter
    if (amenities) {
      const amenityArray = amenities.split(',').map(a => a.trim());
      filter.amenities = { $in: amenityArray };
    }

    // City filter
    if (city) {
      filter['address.city'] = { $regex: city, $options: 'i' };
    }

    // Location-based filter
    if (latitude && longitude) {
      filter['address.coordinates'] = {
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

    const hotels = await Hotel.find(filter)
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ rating: -1, 'priceRange.min': 1 });

    const total = await Hotel.countDocuments(filter);

    res.json({
      hotels,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + hotels.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Hotel search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get hotel by ID
router.get('/:id', async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    res.json(hotel);
  } catch (error) {
    console.error('Hotel fetch error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add hotel review
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
    const hotelId = req.params.id;

    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ message: 'Hotel not found' });
    }

    // Check if user already reviewed this hotel
    const existingReview = hotel.reviews.find(
      review => review.user.toString() === req.user._id.toString()
    );

    if (existingReview) {
      return res.status(400).json({ message: 'You have already reviewed this hotel' });
    }

    // Add review
    hotel.reviews.push({
      user: req.user._id,
      rating: parseFloat(rating),
      comment
    });

    // Update average rating
    const totalRating = hotel.reviews.reduce((sum, review) => sum + review.rating, 0);
    hotel.rating = totalRating / hotel.reviews.length;

    await hotel.save();

    res.json({
      message: 'Review added successfully',
      hotel
    });
  } catch (error) {
    console.error('Review error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get nearby hotels
router.get('/nearby/:latitude/:longitude', [
  query('radius').optional().isFloat().withMessage('Radius must be a number')
], async (req, res) => {
  try {
    const { latitude, longitude } = req.params;
    const radius = req.query.radius || 10000; // Default 10km

    const hotels = await Hotel.find({
      isActive: true,
      'address.coordinates': {
        $near: {
          $geometry: {
            type: 'Point',
            coordinates: [parseFloat(longitude), parseFloat(latitude)]
          },
          $maxDistance: parseFloat(radius)
        }
      }
    }).limit(20);

    res.json(hotels);
  } catch (error) {
    console.error('Nearby hotels error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Search hotels by name
router.get('/search/:query', async (req, res) => {
  try {
    const { query } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const hotels = await Hotel.find({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'address.city': { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    })
    .skip(skip)
    .limit(parseInt(limit))
    .sort({ rating: -1 });

    const total = await Hotel.countDocuments({
      isActive: true,
      $or: [
        { name: { $regex: query, $options: 'i' } },
        { 'address.city': { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ]
    });

    res.json({
      hotels,
      pagination: {
        current: parseInt(page),
        total: Math.ceil(total / parseInt(limit)),
        hasNext: skip + hotels.length < total,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (error) {
    console.error('Hotel search error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 