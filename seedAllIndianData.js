const mongoose = require('mongoose');
const Hotel = require('./models/Hotel');
const Vehicle = require('./models/Vehicle');
const User = require('./models/User');
const { indianLocations } = require('./client/src/data/indianLocations');

const sampleHotelAmenities = [
  ['WiFi', 'Pool', 'Restaurant', 'Parking'],
  ['WiFi', 'Gym', 'Spa', 'Room Service'],
  ['WiFi', 'Bar', 'Air Conditioning', 'Parking'],
];

const sampleVehicleTypes = [
  { type: 'Car', brand: 'Maruti', model: 'Swift', seats: 4, fuelType: 'Petrol', transmission: 'Manual' },
  { type: 'SUV', brand: 'Mahindra', model: 'XUV500', seats: 7, fuelType: 'Diesel', transmission: 'Manual' },
  { type: 'Van', brand: 'Toyota', model: 'Innova', seats: 8, fuelType: 'Diesel', transmission: 'Automatic' },
];

async function seed() {
  await mongoose.connect('mongodb://localhost:27017/tourism-platform');

  // Use the first user as owner for all vehicles
  const user = await User.findOne();
  if (!user) {
    console.error('No user found. Please seed users first.');
    process.exit(1);
  }

  await Hotel.deleteMany({});
  await Vehicle.deleteMany({});

  for (const loc of indianLocations) {
    // Hotels
    for (let i = 0; i < 3; i++) {
      await Hotel.create({
        name: `${loc.city} Hotel ${i + 1}`,
        description: `A wonderful hotel in ${loc.city}, ${loc.state}.`,
        address: {
          street: `Main Road ${i + 1}`,
          city: loc.city,
          state: loc.state,
          country: 'India',
          zipCode: '110001',
          coordinates: { latitude: 0, longitude: 0 }
        },
        rating: 3 + (i % 3),
        priceRange: { min: 2000 + i * 1000, max: 4000 + i * 2000, currency: 'INR' },
        amenities: sampleHotelAmenities[i % sampleHotelAmenities.length],
        images: [],
        contactInfo: { phone: '9999999999', email: `hotel${i + 1}@${loc.city.toLowerCase()}.com`, website: '' },
        roomTypes: [
          { name: 'Standard', description: 'Standard room', price: 2000 + i * 1000, capacity: 2, available: 10 },
          { name: 'Deluxe', description: 'Deluxe room', price: 3000 + i * 1000, capacity: 3, available: 5 }
        ]
      });
    }

    // Vehicles
    for (let i = 0; i < 3; i++) {
      const v = sampleVehicleTypes[i % sampleVehicleTypes.length];
      await Vehicle.create({
        name: `${v.brand} ${v.model} (${loc.city})`,
        type: v.type,
        brand: v.brand,
        model: v.model,
        year: 2020 + i,
        description: `A reliable ${v.type} for your trip in ${loc.city}.`,
        pricePerDay: 1500 + i * 500,
        currency: 'INR',
        location: {
          address: `Rental Office ${i + 1}`,
          city: loc.city,
          state: loc.state,
          coordinates: { latitude: 0, longitude: 0 }
        },
        features: ['Air Conditioning', 'GPS'],
        images: [],
        fuelType: v.fuelType,
        transmission: v.transmission,
        seats: v.seats,
        mileage: 15 + i,
        isAvailable: true,
        owner: user._id
      });
    }
  }

  console.log('Seeded hotels and vehicles for all Indian locations!');
  process.exit(0);
}

seed(); 