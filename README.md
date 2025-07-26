# Yatra - MERN Stack Application

A comprehensive tourism platform built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring hotel booking, vehicle rental, real-time location tracking, and safety features.

## 🌟 Features

### 🏨 Hotel Booking
- Browse hotels across different price ranges (Budget, Mid-range, Luxury)
- Advanced filtering by amenities, ratings, and location
- Real-time availability checking
- Secure booking system with payment integration
- Hotel reviews and ratings

### 🚗 Vehicle Rental
- Wide selection of vehicles (Cars, Motorcycles, Trucks, Vans)
- Filter by vehicle type, transmission, seats, and price range
- Flexible rental periods with pickup/return location options
- Vehicle specifications and features display
- Owner contact information

### 📍 Real-time Location Services
- Google Maps integration for location-based services
- Nearby place suggestions
- Real-time location tracking
- Route planning and directions

### 🛡️ Safety Features
- Location safety checking
- Red alert system for unsafe areas
- Safe alternative location suggestions
- Emergency contact information (hospitals, police stations)
- Safety zone reporting

### 👤 User Management
- User registration and authentication
- Profile management
- Booking history
- Dashboard with statistics
- Secure JWT-based authentication

## 🛠️ Technology Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time communication
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **Google Maps API** - Location services

### Frontend
- **React.js** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Socket.io-client** - Real-time communication
- **React Icons** - Icon library
- **React Toastify** - Notifications
- **CSS3** - Styling with modern design

## 📁 Project Structure

```
myProject/
├── client/                 # React frontend
│   ├── public/
│   └── src/
│       ├── components/     # Reusable components
│       ├── contexts/       # React contexts
│       ├── pages/          # Page components
│       └── App.js          # Main app component
├── models/                 # MongoDB schemas
│   ├── User.js
│   ├── Hotel.js
│   ├── Vehicle.js
│   └── SafetyZone.js
├── routes/                 # API routes
│   ├── auth.js
│   ├── hotels.js
│   ├── vehicles.js
│   ├── location.js
│   └── safety.js
├── server.js              # Express server
├── package.json           # Backend dependencies
└── README.md             # Project documentation
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- Google Maps API key

### Backend Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd myProject
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Variables**
   Create a `.env` file in the root directory:
   ```env
   MONGODB_URI=mongodb://localhost:27017/yatra
   JWT_SECRET=your_jwt_secret_key
   GOOGLE_MAPS_API_KEY=your_google_maps_api_key
   PORT=5000
   ```

4. **Start the server**
   ```bash
   npm start
   # or for development
   npm run server
   ```

### Frontend Setup

1. **Navigate to client directory**
   ```bash
   cd client
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

### Running Both Servers

From the root directory:
```bash
npm run dev
```

This will start both the backend server (port 5000) and frontend development server (port 3000).

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile
- `GET /api/auth/bookings` - Get user bookings
- `GET /api/auth/stats` - Get user statistics

### Hotels
- `GET /api/hotels` - Get all hotels
- `GET /api/hotels/:id` - Get hotel by ID
- `POST /api/hotels/book` - Book a hotel
- `POST /api/hotels/:id/review` - Add hotel review

### Vehicles
- `GET /api/vehicles` - Get all vehicles
- `GET /api/vehicles/:id` - Get vehicle by ID
- `POST /api/vehicles/rent` - Rent a vehicle
- `POST /api/vehicles/:id/review` - Add vehicle review

### Location Services
- `GET /api/location/nearby` - Get nearby places
- `GET /api/location/directions` - Get directions
- `GET /api/location/geocode` - Geocode address

### Safety
- `GET /api/safety/check` - Check location safety
- `GET /api/safety/emergency` - Get emergency contacts
- `POST /api/safety/report` - Report unsafe location

## 🔧 Key Features Implementation

### Real-time Location Tracking
- Uses Socket.io for real-time location updates
- Google Maps API integration for geolocation services
- Location-based safety alerts

### Safety System
- Real-time safety zone checking
- Emergency contact database
- Safe route suggestions
- User safety reporting system

### Booking System
- Secure payment processing
- Real-time availability checking
- Booking confirmation and management
- Review and rating system

## 🎨 UI/UX Features

- **Responsive Design** - Works on all device sizes
- **Modern UI** - Clean and intuitive interface
- **Loading States** - Smooth user experience
- **Error Handling** - User-friendly error messages
- **Toast Notifications** - Real-time feedback
- **Image Galleries** - Hotel and vehicle photos
- **Interactive Maps** - Location visualization

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Environment variable protection
- Secure API endpoints

## 📱 Responsive Design

The application is fully responsive and optimized for:
- Desktop computers
- Tablets
- Mobile phones
- Different screen orientations

## 🚀 Deployment

### Backend Deployment (Heroku)
1. Create a Heroku account
2. Install Heroku CLI
3. Create a new Heroku app
4. Set environment variables
5. Deploy using Git

### Frontend Deployment (Netlify/Vercel)
1. Build the React app: `npm run build`
2. Deploy the build folder to your preferred platform

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Team

- **Backend Development** - Node.js, Express.js, MongoDB
- **Frontend Development** - React.js, CSS3
- **API Integration** - Google Maps, Socket.io
- **UI/UX Design** - Modern, responsive design

## 📞 Support

For support and questions, please contact the development team or create an issue in the repository.

---

**Note**: This is a comprehensive tourism platform with advanced features for hotel booking, vehicle rental, location tracking, and safety monitoring. The application is production-ready with proper security measures and responsive design. 