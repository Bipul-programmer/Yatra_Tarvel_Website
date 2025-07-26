const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
const Vehicle = require('./models/Vehicle');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tourism_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const indianLocations = [
  { city: "Delhi", state: "Delhi" },
  { city: "Mumbai", state: "Maharashtra" },
  { city: "Bangalore", state: "Karnataka" },
  { city: "Chennai", state: "Tamil Nadu" },
  { city: "Hyderabad", state: "Telangana" },
  { city: "Kolkata", state: "West Bengal" },
  { city: "Jaipur", state: "Rajasthan" },
  { city: "Udaipur", state: "Rajasthan" },
  { city: "Goa", state: "Goa" },
  { city: "Agra", state: "Uttar Pradesh" },
  { city: "Varanasi", state: "Uttar Pradesh" },
  { city: "Shimla", state: "Himachal Pradesh" },
  { city: "Manali", state: "Himachal Pradesh" },
  { city: "Rishikesh", state: "Uttarakhand" },
  { city: "Kochi", state: "Kerala" },
  { city: "Munnar", state: "Kerala" },
  { city: "Alleppey", state: "Kerala" },
  { city: "Mysore", state: "Karnataka" },
  { city: "Darjeeling", state: "West Bengal" },
  { city: "Gangtok", state: "Sikkim" }
];

const hotelData = [
  {
    name: "The Taj Palace",
    description: "Luxurious 5-star hotel with stunning city views and world-class amenities",
    address: {
      street: "1 Mansingh Road",
      city: "Delhi",
      state: "Delhi",
      zipCode: "110011",
      country: "India"
    },
    priceRange: { min: 15000, max: 35000 },
    rating: 4.8,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Parking"],
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500"],
    contactInfo: {
      phone: "+91-11-23026162",
      email: "reservations@tajpalace.com"
    }
  },
  {
    name: "Marina Bay Resort",
    description: "Beachfront resort with modern amenities and breathtaking ocean views",
    address: {
      street: "Marine Drive",
      city: "Mumbai",
      state: "Maharashtra",
      zipCode: "400002",
      country: "India"
    },
    priceRange: { min: 12000, max: 28000 },
    rating: 4.6,
    amenities: ["WiFi", "Pool", "Restaurant", "Bar", "Spa", "Parking"],
    images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500"],
    contactInfo: {
      phone: "+91-22-22044040",
      email: "info@marinabay.com"
    }
  },
  {
    name: "Garden City Hotel",
    description: "Elegant hotel in the heart of Bangalore with lush gardens and modern comfort",
    address: {
      street: "MG Road",
      city: "Bangalore",
      state: "Karnataka",
      zipCode: "560001",
      country: "India"
    },
    priceRange: { min: 8000, max: 20000 },
    rating: 4.5,
    amenities: ["WiFi", "Restaurant", "Conference Room", "Parking", "Air Conditioning"],
    images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500"],
    contactInfo: {
      phone: "+91-80-25591111",
      email: "stay@gardencity.com"
    }
  },
  {
    name: "Chennai Heritage Hotel",
    description: "Historic hotel combining traditional architecture with modern luxury",
    address: {
      street: "Anna Salai",
      city: "Chennai",
      state: "Tamil Nadu",
      zipCode: "600002",
      country: "India"
    },
    priceRange: { min: 7000, max: 18000 },
    rating: 4.4,
    amenities: ["WiFi", "Restaurant", "Conference Room", "Air Conditioning", "Room Service"],
    images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500"],
    contactInfo: {
      phone: "+91-44-28555555",
      email: "heritage@chennai.com"
    }
  },
  {
    name: "Hyderabad Pearl Palace",
    description: "Luxury hotel showcasing the rich culture and heritage of Hyderabad",
    address: {
      street: "Banjara Hills",
      city: "Hyderabad",
      state: "Telangana",
      zipCode: "500034",
      country: "India"
    },
    priceRange: { min: 10000, max: 25000 },
    rating: 4.7,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Parking"],
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500"],
    contactInfo: {
      phone: "+91-40-23456789",
      email: "pearl@hyderabad.com"
    }
  },
  {
    name: "Kolkata Royal Hotel",
    description: "Colonial-style hotel in the heart of Kolkata with rich history",
    address: {
      street: "Park Street",
      city: "Kolkata",
      state: "West Bengal",
      zipCode: "700016",
      country: "India"
    },
    priceRange: { min: 9000, max: 22000 },
    rating: 4.5,
    amenities: ["WiFi", "Restaurant", "Bar", "Air Conditioning", "Room Service"],
    images: ["https://images.unsplash.com/photo-1566073771259-6a8506099945?w=500"],
    contactInfo: {
      phone: "+91-33-22223333",
      email: "royal@kolkata.com"
    }
  },
  {
    name: "Pink City Palace",
    description: "Heritage hotel in the Pink City with traditional Rajasthani hospitality",
    address: {
      street: "C-Scheme",
      city: "Jaipur",
      state: "Rajasthan",
      zipCode: "302001",
      country: "India"
    },
    priceRange: { min: 11000, max: 28000 },
    rating: 4.6,
    amenities: ["WiFi", "Restaurant", "Spa", "Air Conditioning", "Room Service"],
    images: ["https://images.unsplash.com/photo-1571896349842-33c89424de2d?w=500"],
    contactInfo: {
      phone: "+91-141-22224444",
      email: "pinkcity@jaipur.com"
    }
  },
  {
    name: "Lake Palace Resort",
    description: "Romantic lakeside resort with stunning views of Lake Pichola",
    address: {
      street: "Lake Palace Road",
      city: "Udaipur",
      state: "Rajasthan",
      zipCode: "313001",
      country: "India"
    },
    priceRange: { min: 15000, max: 35000 },
    rating: 4.8,
    amenities: ["WiFi", "Pool", "Restaurant", "Spa", "Air Conditioning", "Room Service"],
    images: ["https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=500"],
    contactInfo: {
      phone: "+91-294-2428800",
      email: "lake@udaipur.com"
    }
  },
  {
    name: "Goa Beach Resort",
    description: "Tropical paradise with pristine beaches and Portuguese heritage",
    address: {
      street: "Calangute Beach",
      city: "Goa",
      state: "Goa",
      zipCode: "403516",
      country: "India"
    },
    priceRange: { min: 12000, max: 30000 },
    rating: 4.7,
    amenities: ["WiFi", "Pool", "Restaurant", "Bar", "Spa", "Parking"],
    images: ["https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=500"],
    contactInfo: {
      phone: "+91-832-2277777",
      email: "beach@goa.com"
    }
  },
  {
    name: "Taj View Hotel",
    description: "Hotel with spectacular views of the iconic Taj Mahal",
    address: {
      street: "Fatehabad Road",
      city: "Agra",
      state: "Uttar Pradesh",
      zipCode: "282001",
      country: "India"
    },
    priceRange: { min: 13000, max: 32000 },
    rating: 4.8,
    amenities: ["WiFi", "Pool", "Restaurant", "Spa", "Air Conditioning", "Room Service"],
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=500"],
    contactInfo: {
      phone: "+91-562-2333333",
      email: "tajview@agra.com"
    }
  }
];

const dummyOwnerId = "60d21b4667d0d8992e610c85"; // Replace with a real user ObjectId in production

const vehicleData = [
  {
    name: "Toyota Innova Crysta",
    type: "SUV",
    brand: "Toyota",
    model: "Innova Crysta",
    year: 2022,
    description: "Comfortable 7-seater SUV perfect for family trips",
    pricePerDay: 2500,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Diesel",
    mileage: 15,
    location: {
      address: "Airport Road",
      city: "Delhi",
      state: "Delhi"
    },
    images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500"],
    isAvailable: true,
    features: ["Air Conditioning", "GPS", "Bluetooth", "Backup Camera"],
    owner: dummyOwnerId
  },
  {
    name: "Honda City",
    type: "Car",
    brand: "Honda",
    model: "City ZX",
    year: 2021,
    description: "Elegant sedan for comfortable city and highway travel",
    pricePerDay: 1800,
    seats: 5,
    transmission: "Automatic",
    fuelType: "Petrol",
    mileage: 18,
    location: {
      address: "Andheri West",
      city: "Mumbai",
      state: "Maharashtra"
    },
    images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500"],
    isAvailable: true,
    features: ["Air Conditioning", "Bluetooth", "Automatic Transmission"],
    owner: dummyOwnerId
  },
  {
    name: "Maruti Swift",
    type: "Car",
    brand: "Maruti Suzuki",
    model: "Swift VXi",
    year: 2020,
    description: "Compact and fuel-efficient car for city driving",
    pricePerDay: 1200,
    seats: 5,
    transmission: "Manual",
    fuelType: "Petrol",
    mileage: 22,
    location: {
      address: "Indiranagar",
      city: "Bangalore",
      state: "Karnataka"
    },
    images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500"],
    isAvailable: true,
    features: ["Air Conditioning", "Manual Transmission"],
    owner: dummyOwnerId
  },
  {
    name: "Hyundai Creta",
    type: "SUV",
    brand: "Hyundai",
    model: "Creta SX",
    year: 2022,
    description: "Modern SUV with advanced features and comfortable interior",
    pricePerDay: 2200,
    seats: 5,
    transmission: "Automatic",
    fuelType: "Petrol",
    mileage: 16,
    location: {
      address: "T Nagar",
      city: "Chennai",
      state: "Tamil Nadu"
    },
    images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500"],
    isAvailable: true,
    features: ["Air Conditioning", "GPS", "Bluetooth", "Backup Camera", "Automatic Transmission"],
    owner: dummyOwnerId
  },
  {
    name: "Mahindra XUV500",
    type: "SUV",
    brand: "Mahindra",
    model: "XUV500 W11",
    year: 2021,
    description: "Premium SUV with powerful engine and spacious cabin",
    pricePerDay: 2800,
    seats: 7,
    transmission: "Manual",
    fuelType: "Diesel",
    mileage: 14,
    location: {
      address: "Gachibowli",
      city: "Hyderabad",
      state: "Telangana"
    },
    images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500"],
    isAvailable: true,
    features: ["Air Conditioning", "GPS", "Bluetooth", "Manual Transmission"],
    owner: dummyOwnerId
  },
  {
    name: "Tata Nexon EV",
    type: "Car",
    brand: "Tata",
    model: "Nexon EV",
    year: 2023,
    description: "Electric vehicle with zero emissions and modern technology",
    pricePerDay: 2000,
    seats: 5,
    transmission: "Automatic",
    fuelType: "Electric",
    mileage: 312,
    location: {
      address: "Salt Lake",
      city: "Kolkata",
      state: "West Bengal"
    },
    images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500"],
    isAvailable: true,
    features: ["Air Conditioning", "GPS", "Bluetooth", "Automatic Transmission"],
    owner: dummyOwnerId
  },
  {
    name: "Royal Enfield Classic 350",
    type: "Motorcycle",
    brand: "Royal Enfield",
    model: "Classic 350",
    year: 2022,
    description: "Iconic motorcycle perfect for exploring Rajasthan",
    pricePerDay: 800,
    seats: 2,
    transmission: "Manual",
    fuelType: "Petrol",
    mileage: 35,
    location: {
      address: "C-Scheme",
      city: "Jaipur",
      state: "Rajasthan"
    },
    images: ["https://images.unsplash.com/photo-1558981806-ec527fa84a39?w=500"],
    isAvailable: true,
    features: ["Manual Transmission"],
    owner: dummyOwnerId
  },
  {
    name: "Maruti Ertiga",
    type: "Van",
    brand: "Maruti Suzuki",
    model: "Ertiga ZXi",
    year: 2021,
    description: "Multi-purpose vehicle ideal for group travel",
    pricePerDay: 2000,
    seats: 7,
    transmission: "Manual",
    fuelType: "Petrol",
    mileage: 20,
    location: {
      address: "Lake Palace Road",
      city: "Udaipur",
      state: "Rajasthan"
    },
    images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500"],
    isAvailable: true,
    features: ["Air Conditioning", "Manual Transmission"],
    owner: dummyOwnerId
  },
  {
    name: "Honda Activa",
    type: "Scooter",
    brand: "Honda",
    model: "Activa 6G",
    year: 2022,
    description: "Convenient scooter for exploring Goa's beaches",
    pricePerDay: 400,
    seats: 2,
    transmission: "Automatic",
    fuelType: "Petrol",
    mileage: 60,
    location: {
      address: "Panaji",
      city: "Goa",
      state: "Goa"
    },
    images: ["https://images.unsplash.com/photo-1558981806-ec527fa84a39?w=500"],
    isAvailable: true,
    features: ["Automatic Transmission"],
    owner: dummyOwnerId
  },
  {
    name: "Toyota Fortuner",
    type: "SUV",
    brand: "Toyota",
    model: "Fortuner",
    year: 2023,
    description: "Premium SUV for luxury travel and adventure",
    pricePerDay: 3500,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Diesel",
    mileage: 12,
    location: {
      address: "Fatehabad Road",
      city: "Agra",
      state: "Uttar Pradesh"
    },
    images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=500"],
    isAvailable: true,
    features: ["Air Conditioning", "GPS", "Bluetooth", "Backup Camera", "Automatic Transmission"],
    owner: dummyOwnerId
  }
];

async function seedData() {
  try {
    // Clear existing data
    await Hotel.deleteMany({});
    await Vehicle.deleteMany({});
    
    console.log('Cleared existing data');

    // Insert hotels
    const hotels = await Hotel.insertMany(hotelData);
    console.log(`Inserted ${hotels.length} hotels`);

    // Insert vehicles
    const vehicles = await Vehicle.insertMany(vehicleData);
    console.log(`Inserted ${vehicles.length} vehicles`);

    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData(); 