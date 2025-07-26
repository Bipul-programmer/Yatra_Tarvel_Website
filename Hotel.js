const mongoose = require('mongoose');

const hotelSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    zipCode: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  rating: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  priceRange: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    },
    currency: {
      type: String,
      default: 'USD'
    }
  },
  amenities: [{
    type: String,
    enum: ['WiFi', 'Pool', 'Gym', 'Restaurant', 'Spa', 'Parking', 'Air Conditioning', 'Room Service', 'Bar', 'Conference Room']
  }],
  images: [String],
  contactInfo: {
    phone: String,
    email: String,
    website: String
  },
  roomTypes: [{
    name: String,
    description: String,
    price: Number,
    capacity: Number,
    available: {
      type: Number,
      default: 10
    }
  }],
  reviews: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    comment: String,
    date: {
      type: Date,
      default: Date.now
    }
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for location-based queries
hotelSchema.index({ "address.coordinates": "2dsphere" });

module.exports = mongoose.model('Hotel', hotelSchema); 