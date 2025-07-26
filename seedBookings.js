const mongoose = require('mongoose');
const Booking = require('./models/Booking');
const User = require('./models/User');
const Hotel = require('./models/Hotel');
const Vehicle = require('./models/Vehicle');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tourism_platform', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const bookingData = [
  {
    type: 'hotel',
    itemName: 'The Taj Palace',
    startDate: new Date('2024-01-15'),
    endDate: new Date('2024-01-18'),
    totalPrice: 45000,
    status: 'completed'
  },
  {
    type: 'hotel',
    itemName: 'Marina Bay Resort',
    startDate: new Date('2024-02-20'),
    endDate: new Date('2024-02-25'),
    totalPrice: 60000,
    status: 'confirmed'
  },
  {
    type: 'vehicle',
    itemName: 'Toyota Innova Crysta',
    startDate: new Date('2024-01-16'),
    endDate: new Date('2024-01-19'),
    totalPrice: 7500,
    status: 'completed'
  },
  {
    type: 'vehicle',
    itemName: 'Honda City',
    startDate: new Date('2024-02-21'),
    endDate: new Date('2024-02-26'),
    totalPrice: 9000,
    status: 'confirmed'
  },
  {
    type: 'hotel',
    itemName: 'Garden City Hotel',
    startDate: new Date('2024-03-10'),
    endDate: new Date('2024-03-15'),
    totalPrice: 40000,
    status: 'confirmed'
  },
  {
    type: 'vehicle',
    itemName: 'Maruti Swift',
    startDate: new Date('2024-03-11'),
    endDate: new Date('2024-03-16'),
    totalPrice: 6000,
    status: 'confirmed'
  },
  {
    type: 'hotel',
    itemName: 'Hyderabad Pearl Palace',
    startDate: new Date('2024-04-05'),
    endDate: new Date('2024-04-08'),
    totalPrice: 50000,
    status: 'confirmed'
  },
  {
    type: 'vehicle',
    itemName: 'Hyundai Creta',
    startDate: new Date('2024-04-06'),
    endDate: new Date('2024-04-09'),
    totalPrice: 6600,
    status: 'confirmed'
  }
];

async function seedBookings() {
  try {
    // Clear existing bookings
    await Booking.deleteMany({});
    console.log('Cleared existing bookings');

    // Get a user (use the first user in the database)
    const user = await User.findOne();
    if (!user) {
      console.error('No users found in database. Please create a user first.');
      process.exit(1);
    }

    // Get hotels and vehicles for reference
    const hotels = await Hotel.find();
    const vehicles = await Vehicle.find();

    if (hotels.length === 0 || vehicles.length === 0) {
      console.error('No hotels or vehicles found. Please run the hotel/vehicle seeder first.');
      process.exit(1);
    }

    console.log(`Found ${hotels.length} hotels and ${vehicles.length} vehicles`);

    // Create bookings
    const bookings = [];
    for (const bookingInfo of bookingData) {
      let item;
      if (bookingInfo.type === 'hotel') {
        item = hotels.find(h => h.name === bookingInfo.itemName);
      } else {
        item = vehicles.find(v => v.name === bookingInfo.itemName);
      }

      if (item) {
        const booking = new Booking({
          user: user._id,
          type: bookingInfo.type,
          item: item._id,
          itemName: bookingInfo.itemName,
          startDate: bookingInfo.startDate,
          endDate: bookingInfo.endDate,
          totalPrice: bookingInfo.totalPrice,
          status: bookingInfo.status
        });
        bookings.push(booking);
      } else {
        console.warn(`Item not found: ${bookingInfo.itemName}`);
      }
    }

    // Insert bookings
    const insertedBookings = await Booking.insertMany(bookings);
    console.log(`Inserted ${insertedBookings.length} bookings for user: ${user.name} (${user.email})`);

    // Display summary
    const stats = await Booking.aggregate([
      { $match: { user: user._id } },
      {
        $group: {
          _id: null,
          totalBookings: { $sum: 1 },
          totalSpent: { $sum: '$totalPrice' },
          completedBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'completed'] }, 1, 0] }
          },
          activeBookings: {
            $sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] }
          }
        }
      }
    ]);

    if (stats.length > 0) {
      const stat = stats[0];
      console.log('\nBooking Summary:');
      console.log(`Total Bookings: ${stat.totalBookings}`);
      console.log(`Active Bookings: ${stat.activeBookings}`);
      console.log(`Completed Bookings: ${stat.completedBookings}`);
      console.log(`Total Spent: ₹${stat.totalSpent.toLocaleString()}`);
    }

    console.log('\nBooking data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding booking data:', error);
    process.exit(1);
  }
}

seedBookings(); 