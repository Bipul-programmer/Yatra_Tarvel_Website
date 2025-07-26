const mongoose = require('mongoose');

const safetyZoneSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['Safe', 'Dangerous', 'Warning']
  },
  coordinates: {
    latitude: {
      type: Number,
      required: true
    },
    longitude: {
      type: Number,
      required: true
    }
  },
  radius: {
    type: Number,
    default: 1000 // in meters
  },
  description: {
    type: String,
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Low'
  },
  reasons: [{
    type: String,
    enum: ['Crime', 'Natural Disaster', 'Political Unrest', 'Health Emergency', 'Infrastructure Issues', 'Weather', 'Other']
  }],
  emergencyContacts: {
    police: {
      name: String,
      phone: String,
      address: String,
      distance: Number
    },
    hospital: {
      name: String,
      phone: String,
      address: String,
      distance: Number
    },
    fireStation: {
      name: String,
      phone: String,
      address: String,
      distance: Number
    }
  },
  safeAlternatives: [{
    name: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    },
    distance: Number,
    description: String
  }],
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  reportedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verified: {
    type: Boolean,
    default: false
  }
});

// Index for geospatial queries
safetyZoneSchema.index({ coordinates: "2dsphere" });

module.exports = mongoose.model('SafetyZone', safetyZoneSchema); 