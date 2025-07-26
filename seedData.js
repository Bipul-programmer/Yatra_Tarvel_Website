const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
const Vehicle = require('./models/Vehicle');
require('dotenv').config();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tourism-platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const hotels = [
  {
    name: "The Taj Mahal Palace",
    description: "Iconic luxury hotel overlooking the Gateway of India and Arabian Sea. Experience world-class hospitality with stunning views of Mumbai's harbor. Features heritage architecture, award-winning restaurants, and the legendary Sea Lounge.",
    address: {
      street: "Apollo Bunder",
      city: "Mumbai",
      state: "Maharashtra",
      country: "India",
      zipCode: "400001"
    },
    priceRange: {
      min: 25000,
      max: 75000,
      currency: "INR"
    },
    rating: 4.9,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Room Service", "Bar", "Conference Room"],
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"
    ],
    contactInfo: {
      phone: "+91-22-6665-3366",
      email: "reservations.taj@tajhotels.com",
      website: "https://www.tajhotels.com"
    },
    roomTypes: [
      {
        name: "Deluxe Room",
        description: "Elegant room with city or sea view",
        price: 25000,
        capacity: 2,
        available: 15
      },
      {
        name: "Heritage Suite",
        description: "Luxury suite with historical charm",
        price: 75000,
        capacity: 4,
        available: 5
      }
    ]
  },
  {
    name: "The Oberoi Amarvilas",
    description: "Breathtaking luxury resort with uninterrupted views of the Taj Mahal. Every room offers a view of this architectural wonder. Experience Mughal-inspired design, world-class dining, and impeccable service in the heart of Agra.",
    address: {
      street: "Taj East Gate Road",
      city: "Agra",
      state: "Uttar Pradesh",
      country: "India",
      zipCode: "282001"
    },
    priceRange: {
      min: 35000,
      max: 120000,
      currency: "INR"
    },
    rating: 4.8,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Room Service", "Bar", "Conference Room"],
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800"
    ],
    contactInfo: {
      phone: "+91-562-223-1515",
      email: "reservations.amarvilas@oberoihotels.com",
      website: "https://www.oberoihotels.com"
    },
    roomTypes: [
      {
        name: "Premier Room",
        description: "Room with Taj Mahal view",
        price: 35000,
        capacity: 2,
        available: 20
      },
      {
        name: "Kohinoor Suite",
        description: "Ultimate luxury suite with private terrace",
        price: 120000,
        capacity: 4,
        available: 3
      }
    ]
  },
  {
    name: "The Leela Palace",
    description: "Palatial luxury hotel in the heart of New Delhi, inspired by Lutyens' Delhi architecture. Features opulent interiors, award-winning restaurants, and the largest spa in Delhi. Perfect blend of heritage and modern luxury.",
    address: {
      street: "Diplomatic Enclave, Chanakyapuri",
      city: "New Delhi",
      state: "Delhi",
      country: "India",
      zipCode: "110023"
    },
    priceRange: {
      min: 20000,
      max: 80000,
      currency: "INR"
    },
    rating: 4.7,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Room Service", "Bar", "Conference Room"],
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"
    ],
    contactInfo: {
      phone: "+91-11-3933-1234",
      email: "reservations.delhi@theleela.com",
      website: "https://www.theleela.com"
    },
    roomTypes: [
      {
        name: "Deluxe Room",
        description: "Elegant room with city views",
        price: 20000,
        capacity: 2,
        available: 25
      },
      {
        name: "Royal Suite",
        description: "Palatial suite with butler service",
        price: 80000,
        capacity: 4,
        available: 8
      }
    ]
  },
  {
    name: "Taj Lake Palace",
    description: "Floating palace hotel in the middle of Lake Pichola, offering a magical experience in Udaipur. Built entirely of marble, this heritage hotel provides stunning lake views, royal treatment, and authentic Rajasthani hospitality.",
    address: {
      street: "Lake Pichola",
      city: "Udaipur",
      state: "Rajasthan",
      country: "India",
      zipCode: "313001"
    },
    priceRange: {
      min: 30000,
      max: 100000,
      currency: "INR"
    },
    rating: 4.9,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Room Service", "Bar", "Conference Room"],
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800"
    ],
    contactInfo: {
      phone: "+91-294-242-8800",
      email: "reservations.lakepalace@tajhotels.com",
      website: "https://www.tajhotels.com"
    },
    roomTypes: [
      {
        name: "Lake View Room",
        description: "Room with panoramic lake views",
        price: 30000,
        capacity: 2,
        available: 18
      },
      {
        name: "Grand Royal Suite",
        description: "Ultimate luxury with private terrace",
        price: 100000,
        capacity: 4,
        available: 4
      }
    ]
  },
  {
    name: "The Oberoi Grand",
    description: "Historic luxury hotel in the heart of Kolkata, combining colonial charm with modern amenities. Located on Chowringhee Road, it offers easy access to Victoria Memorial and other city attractions.",
    address: {
      street: "15 Jawaharlal Nehru Road",
      city: "Kolkata",
      state: "West Bengal",
      country: "India",
      zipCode: "700013"
    },
    priceRange: {
      min: 15000,
      max: 60000,
      currency: "INR"
    },
    rating: 4.6,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Room Service", "Bar", "Conference Room"],
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"
    ],
    contactInfo: {
      phone: "+91-33-2249-2323",
      email: "reservations.grand@oberoihotels.com",
      website: "https://www.oberoihotels.com"
    },
    roomTypes: [
      {
        name: "Deluxe Room",
        description: "Comfortable room with city views",
        price: 15000,
        capacity: 2,
        available: 30
      },
      {
        name: "Heritage Suite",
        description: "Luxury suite with colonial charm",
        price: 60000,
        capacity: 4,
        available: 6
      }
    ]
  },
  {
    name: "Taj Falaknuma Palace",
    description: "Former palace of the Nizam of Hyderabad, now a luxury hotel perched 2000 feet above the city. Experience royal living with original palace architecture, vintage furniture, and panoramic views of Hyderabad.",
    address: {
      street: "Engine Bowli, Falaknuma",
      city: "Hyderabad",
      state: "Telangana",
      country: "India",
      zipCode: "500053"
    },
    priceRange: {
      min: 25000,
      max: 90000,
      currency: "INR"
    },
    rating: 4.8,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Room Service", "Bar", "Conference Room"],
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800"
    ],
    contactInfo: {
      phone: "+91-40-6629-8585",
      email: "reservations.falaknuma@tajhotels.com",
      website: "https://www.tajhotels.com"
    },
    roomTypes: [
      {
        name: "Palace Room",
        description: "Elegant room with palace views",
        price: 25000,
        capacity: 2,
        available: 22
      },
      {
        name: "Grand Presidential Suite",
        description: "Ultimate luxury in the palace",
        price: 90000,
        capacity: 4,
        available: 2
      }
    ]
  },
  {
    name: "The Leela Palace",
    description: "Beachfront luxury resort in Goa, offering pristine beaches and tropical paradise. Features Portuguese-inspired architecture, world-class spa, and multiple dining options with fresh seafood and Goan cuisine.",
    address: {
      street: "Mobor, Cavelossim",
      city: "Goa",
      state: "Goa",
      country: "India",
      zipCode: "403731"
    },
    priceRange: {
      min: 18000,
      max: 70000,
      currency: "INR"
    },
    rating: 4.7,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Room Service", "Bar", "Conference Room"],
    images: [
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=800",
      "https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?w=800"
    ],
    contactInfo: {
      phone: "+91-832-287-1234",
      email: "reservations.goa@theleela.com",
      website: "https://www.theleela.com"
    },
    roomTypes: [
      {
        name: "Deluxe Room",
        description: "Room with garden or pool view",
        price: 18000,
        capacity: 2,
        available: 35
      },
      {
        name: "Beach Villa",
        description: "Private villa with beach access",
        price: 70000,
        capacity: 4,
        available: 8
      }
    ]
  },
  {
    name: "The Oberoi Sukhvilas",
    description: "Luxury spa resort in the foothills of the Himalayas, offering wellness and tranquility. Features traditional Indian healing therapies, organic dining, and stunning mountain views in a peaceful setting.",
    address: {
      street: "New Chandigarh",
      city: "Chandigarh",
      state: "Punjab",
      country: "India",
      zipCode: "140307"
    },
    priceRange: {
      min: 12000,
      max: 45000,
      currency: "INR"
    },
    rating: 4.5,
    amenities: ["WiFi", "Pool", "Spa", "Restaurant", "Gym", "Room Service", "Bar", "Conference Room"],
    images: [
      "https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?w=800",
      "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?w=800"
    ],
    contactInfo: {
      phone: "+91-172-500-1000",
      email: "reservations.sukhvilas@oberoihotels.com",
      website: "https://www.oberoihotels.com"
    },
    roomTypes: [
      {
        name: "Wellness Room",
        description: "Peaceful room with mountain views",
        price: 12000,
        capacity: 2,
        available: 40
      },
      {
        name: "Spa Villa",
        description: "Private villa with spa facilities",
        price: 45000,
        capacity: 4,
        available: 10
      }
    ]
  }
];

// Create a dummy user ID for vehicle ownership
const dummyUserId = new mongoose.Types.ObjectId();

const vehicles = [
  {
    name: "Toyota Innova Crysta",
    brand: "Toyota",
    model: "Innova Crysta",
    year: 2022,
    type: "SUV",
    pricePerDay: 2500,
    seats: 7,
    transmission: "Automatic",
    fuelType: "Diesel",
    mileage: 12,
    features: ["Air Conditioning", "GPS", "Bluetooth", "Backup Camera"],
    images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800"],
    location: {
      address: "123 MG Road",
      city: "Mumbai",
      state: "Maharashtra"
    },
    description: "Comfortable 7-seater SUV perfect for family trips and airport transfers.",
    isAvailable: true,
    owner: dummyUserId,
    currency: "INR"
  },
  {
    name: "Honda City",
    brand: "Honda",
    model: "City",
    year: 2023,
    type: "Car",
    pricePerDay: 1500,
    seats: 5,
    transmission: "Automatic",
    fuelType: "Petrol",
    mileage: 18,
    features: ["Air Conditioning", "GPS", "Bluetooth"],
    images: ["https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=800"],
    location: {
      address: "456 Park Street",
      city: "Delhi",
      state: "Delhi"
    },
    description: "Reliable sedan for city commuting and business travel.",
    isAvailable: true,
    owner: dummyUserId,
    currency: "INR"
  },
  {
    name: "Royal Enfield Classic 350",
    brand: "Royal Enfield",
    model: "Classic 350",
    year: 2022,
    type: "Motorcycle",
    pricePerDay: 800,
    seats: 2,
    transmission: "Manual",
    fuelType: "Petrol",
    mileage: 35,
    features: ["GPS", "Bluetooth"],
    images: ["https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800"],
    location: {
      address: "789 Brigade Road",
      city: "Bangalore",
      state: "Karnataka"
    },
    description: "Iconic motorcycle perfect for exploring city streets and countryside.",
    isAvailable: true,
    owner: dummyUserId,
    currency: "INR"
  },
  {
    name: "Mahindra XUV500",
    brand: "Mahindra",
    model: "XUV500",
    year: 2021,
    type: "SUV",
    pricePerDay: 2000,
    seats: 7,
    transmission: "Manual",
    fuelType: "Diesel",
    mileage: 15,
    features: ["Air Conditioning", "GPS", "Bluetooth", "Backup Camera"],
    images: ["https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=800"],
    location: {
      address: "321 Commercial Street",
      city: "Chennai",
      state: "Tamil Nadu"
    },
    description: "Robust SUV ideal for family trips and adventure travel.",
    isAvailable: true,
    owner: dummyUserId,
    currency: "INR"
  }
];

const seedData = async () => {
  try {
    console.log('Connected to MongoDB');
    
    // Clear existing data
    await Hotel.deleteMany({});
    await Vehicle.deleteMany({});
    console.log('Cleared existing data');
    
    // Insert hotels
    const insertedHotels = await Hotel.insertMany(hotels);
    console.log(`Inserted ${insertedHotels.length} hotels`);
    
    // Insert vehicles
    const insertedVehicles = await Vehicle.insertMany(vehicles);
    console.log(`Inserted ${insertedVehicles.length} vehicles`);
    
    console.log('Data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
};

seedData(); 