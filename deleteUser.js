const mongoose = require('mongoose');
const User = require('./models/User');

mongoose.connect('mongodb://localhost:27017/tourism_platform', { useNewUrlParser: true, useUnifiedTopology: true });

User.deleteOne({ email: 'test@example.com' })
  .then(result => {
    console.log('Deleted test user:', result);
    process.exit(0);
  })
  .catch(err => {
    console.error('Error deleting test user:', err);
    process.exit(1);
  }); 