const express = require('express');
const Booking = require('../models/Booking');
const User = require('../models/User');

const router = express.Router();

// Auth middleware (copied from other routes)
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

// Dashboard stats endpoint
router.get('/stats', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const totalBookings = await Booking.countDocuments({ user: userId });
    const now = new Date();
    const activeBookings = await Booking.countDocuments({
      user: userId,
      startDate: { $lte: now },
      endDate: { $gte: now },
      status: { $in: ['confirmed'] }
    });
    const completedBookings = await Booking.find({ user: userId, status: 'completed' });
    const totalSpent = completedBookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0);
    // For demo, averageRating is random or 0
    const averageRating = 4.5;
    res.json({ totalBookings, activeBookings, totalSpent, averageRating });
  } catch (error) {
    console.error('Dashboard stats error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Dashboard recent bookings endpoint
router.get('/recent', auth, async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 5;
    const bookings = await Booking.find({ user: userId })
      .sort({ createdAt: -1 })
      .limit(limit);
    res.json({ bookings });
  } catch (error) {
    console.error('Dashboard bookings error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 