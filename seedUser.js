const mongoose = require('mongoose');
const User = require('./models/User');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tourism_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function seedUser() {
  try {
    // Check if user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    if (existingUser) {
      console.log('Test user already exists:', existingUser.email);
      process.exit(0);
    }

    // Create test user
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      phone: '+91-9876543210'
    });

    await user.save();
    console.log('Created test user:', user.email);
    console.log('User ID:', user._id);
    process.exit(0);
  } catch (error) {
    console.error('Error creating user:', error);
    process.exit(1);
  }
}

seedUser(); 