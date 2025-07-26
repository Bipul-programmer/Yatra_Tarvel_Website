const express = require('express');
const router = express.Router();
const Cart = require('../models/Cart');
const Hotel = require('../models/Hotel');
const Vehicle = require('../models/Vehicle');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Auth middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'No token, authorization denied' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ message: 'Token is not valid' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ message: 'Token is not valid' });
  }
};

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ user: req.user.id }).populate('items.itemId');
    
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
      await cart.save();
    }
    
    res.json(cart);
  } catch (error) {
    console.error('Error fetching cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { itemType, itemId, startDate, endDate, quantity = 1 } = req.body;
    
    if (!itemType || !itemId || !startDate || !endDate) {
      return res.status(400).json({ message: 'Missing required fields' });
    }
    
    // Validate item exists
    let item;
    if (itemType === 'hotel') {
      item = await Hotel.findById(itemId);
    } else if (itemType === 'vehicle') {
      item = await Vehicle.findById(itemId);
    } else {
      return res.status(400).json({ message: 'Invalid item type' });
    }
    
    if (!item) {
      return res.status(404).json({ message: 'Item not found' });
    }
    
    // Calculate dates and price
    const start = new Date(startDate);
    const end = new Date(endDate);
    const days = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
    
    if (days <= 0) {
      return res.status(400).json({ message: 'Invalid date range' });
    }
    
    const pricePerDay = itemType === 'hotel' ? item.priceRange.min : item.pricePerDay;
    const totalPrice = pricePerDay * days * quantity;
    
    // Get or create cart
    let cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      cart = new Cart({ user: req.user.id, items: [] });
    }
    
    // Prepare item data
    const itemData = {
      itemType,
      itemId,
      quantity,
      startDate: start,
      endDate: end,
      pricePerDay,
      totalPrice,
      itemDetails: {
        name: item.name,
        image: item.images?.[0] || '',
        location: itemType === 'hotel' ? 
          `${item.address?.city}, ${item.address?.state}` : 
          `${item.location?.city}, ${item.location?.state}`
      }
    };
    
    // Add item to cart
    cart.addItem(itemData);
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Remove item from cart
router.delete('/remove/:itemId/:itemType', auth, async (req, res) => {
  try {
    const { itemId, itemType } = req.params;
    
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.removeItem(itemId, itemType);
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error removing from cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Clear cart
router.delete('/clear', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user.id });
    if (!cart) {
      return res.status(404).json({ message: 'Cart not found' });
    }
    
    cart.clearCart();
    await cart.save();
    
    res.json(cart);
  } catch (error) {
    console.error('Error clearing cart:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Process payment (placeholder for now)
router.post('/checkout', auth, async (req, res) => {
  try {
    const { paymentMethod, billingAddress } = req.body;
    
    const cart = await Cart.findOne({ user: req.user.id }).populate('items.itemId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    // Here you would integrate with a payment gateway
    // For now, we'll just simulate a successful payment
    
    // Create order/booking records here
    // Clear the cart after successful payment
    
    cart.clearCart();
    await cart.save();
    
    res.json({ 
      message: 'Payment processed successfully',
      orderId: `ORD-${Date.now()}`,
      total: cart.total
    });
  } catch (error) {
    console.error('Error processing payment:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 