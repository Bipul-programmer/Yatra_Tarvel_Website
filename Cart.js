const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  itemType: {
    type: String,
    enum: ['hotel', 'vehicle'],
    required: true
  },
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'itemType'
  },
  quantity: {
    type: Number,
    default: 1,
    min: 1
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  pricePerDay: {
    type: Number,
    required: true
  },
  totalPrice: {
    type: Number,
    required: true
  },
  itemDetails: {
    name: String,
    image: String,
    location: String
  }
});

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [cartItemSchema],
  subtotal: {
    type: Number,
    default: 0
  },
  tax: {
    type: Number,
    default: 0
  },
  total: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Calculate totals before saving
cartSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  
  // Calculate subtotal
  this.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0);
  
  // Calculate tax (18% GST)
  this.tax = this.subtotal * 0.18;
  
  // Calculate total
  this.total = this.subtotal + this.tax;
  
  next();
});

// Method to add item to cart
cartSchema.methods.addItem = function(itemData) {
  const existingItemIndex = this.items.findIndex(
    item => item.itemId.toString() === itemData.itemId.toString() && 
            item.itemType === itemData.itemType
  );

  if (existingItemIndex > -1) {
    // Update existing item
    this.items[existingItemIndex].quantity = itemData.quantity;
    this.items[existingItemIndex].startDate = itemData.startDate;
    this.items[existingItemIndex].endDate = itemData.endDate;
    this.items[existingItemIndex].totalPrice = itemData.totalPrice;
  } else {
    // Add new item
    this.items.push(itemData);
  }
};

// Method to remove item from cart
cartSchema.methods.removeItem = function(itemId, itemType) {
  this.items = this.items.filter(
    item => !(item.itemId.toString() === itemId.toString() && item.itemType === itemType)
  );
};

// Method to clear cart
cartSchema.methods.clearCart = function() {
  this.items = [];
  this.subtotal = 0;
  this.tax = 0;
  this.total = 0;
};

module.exports = mongoose.model('Cart', cartSchema); 