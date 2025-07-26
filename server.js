const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const socketIo = require('socket.io');
const passport = require('passport');
const session = require('express-session');
const fs = require('fs');
const logStream = fs.createWriteStream('server.log', { flags: 'a' });
const path = require('path');

function logToFile(message) {
  const timestamp = new Date().toISOString();
  logStream.write(`[${timestamp}] ${message}\n`);
}

// Load environment variables
dotenv.config();

// Import routes
const authRoutes = require('./routes/auth');
const hotelRoutes = require('./routes/hotels');
const vehicleRoutes = require('./routes/vehicles');
const locationRoutes = require('./routes/location');
const safetyRoutes = require('./routes/safety');
const cartRoutes = require('./routes/cart');
const bookingsRoutes = require('./routes/bookings');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session middleware for OAuth
app.use(session({
  secret: process.env.SESSION_SECRET || 'your-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Database connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tourism-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected successfully');
  logToFile('MongoDB connected successfully');
})
.catch(err => {
  console.error('MongoDB connection error:', err);
  logToFile('MongoDB connection error: ' + err);
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotels', hotelRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/location', locationRoutes);
app.use('/api/safety', safetyRoutes);
app.use('/api/cart', require('./routes/cart'));
app.use('/api/bookings', require('./routes/bookings'));

// Socket.io for real-time location tracking
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);
  logToFile('User connected: ' + socket.id);

  socket.on('updateLocation', (data) => {
    // Broadcast location update to all connected clients
    socket.broadcast.emit('locationUpdated', data);
  });

  socket.on('safetyAlert', (data) => {
    // Broadcast safety alert to all connected clients
    io.emit('safetyAlert', data);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
    logToFile('User disconnected: ' + socket.id);
  });
});

// Serve React production build
app.use(express.static(path.join(__dirname, 'client', 'build')));
app.get('*', (req, res) => {
  if (req.path.startsWith('/api/')) return; // Let API routes handle their own responses
  res.sendFile(path.join(__dirname, 'client', 'build', 'index.html'));
});

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Tourism Platform API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  logToFile('Express error: ' + err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 5001;

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 