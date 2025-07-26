const mongoose = require('mongoose');

const vehicleSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Car', 'SUV', 'Van', 'Motorcycle', 'Bicycle', 'Scooter']
  },
  brand: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  year: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  pricePerDay: {
    type: Number,
    required: true
  },
  pricePerHour: {
    type: Number
  },
  currency: {
    type: String,
    default: 'USD'
  },
  location: {
    address: String,
    city: String,
    state: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  features: [{
    type: String,
    enum: ['Air Conditioning', 'GPS', 'Bluetooth', 'Backup Camera', 'Child Seat', 'Roof Rack', 'All-Wheel Drive', 'Automatic Transmission', 'Manual Transmission']
  }],
  images: [String],
  fuelType: {
    type: String,
    enum: ['Petrol', 'Diesel', 'Electric', 'Hybrid', 'CNG']
  },
  transmission: {
    type: String,
    enum: ['Automatic', 'Manual']
  },
  seats: {
    type: Number,
    required: true
  },
  mileage: {
    type: Number
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
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
  averageRating: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for location-based queries
vehicleSchema.index({ "location.coordinates": "2dsphere" });

module.exports = mongoose.model('Vehicle', vehicleSchema); 