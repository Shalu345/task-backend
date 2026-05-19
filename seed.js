const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const Appointment = require('./models/Appointment');

dotenv.config();

const seedDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await Appointment.deleteMany({});
    console.log('Cleared existing Users and Appointments.');

    // Passwords need to be pre-hashed or we let the mongoose pre-save hook do it.
    // The User model has a pre-save hook that hashes the password, so we pass plain text 'password123'.

    // Create 1 Admin
    const adminUser = await User.create({
      name: 'Prof. Shubham (Senior Mentor / Academic Advisor)',
      email: 'admin@scheduler.com',
      password: 'password123',
      role: 'admin'
    });

    // Create 4 regular Users (Students)
    const user1 = await User.create({
      name: 'Ryan Collins (Student)',
      email: 'ryan@patient.com',
      password: 'password123',
      role: 'user'
    });

    const user2 = await User.create({
      name: 'Adam Morris (Student)',
      email: 'adam@patient.com',
      password: 'password123',
      role: 'user'
    });

    const user3 = await User.create({
      name: 'Aidan Walsh (Student)',
      email: 'aidan@patient.com',
      password: 'password123',
      role: 'user'
    });

    const user4 = await User.create({
      name: 'Nathan Collins (Student)',
      email: 'nathan@patient.com',
      password: 'password123',
      role: 'user'
    });

    console.log('Successfully seeded 1 Mentor Admin and 4 Student Users!');

    // Create sample appointments for today (2026-05-19) and tomorrow (2026-05-20)
    const today = '2026-05-19';
    const tomorrow = '2026-05-20';

    await Appointment.create([
      {
        user: user1._id,
        date: today,
        startTime: '09:00',
        endTime: '10:00',
        status: 'booked'
      },
      {
        user: user2._id,
        date: today,
        startTime: '10:00',
        endTime: '11:00',
        status: 'booked'
      },
      {
        user: user3._id,
        date: today,
        startTime: '14:00',
        endTime: '15:00',
        status: 'booked'
      },
      {
        user: user4._id,
        date: tomorrow,
        startTime: '11:00',
        endTime: '12:00',
        status: 'booked'
      }
    ]);

    console.log('Successfully seeded sample Appointments for testing!');
    mongoose.connection.close();
    console.log('Database seeding completed. Connection closed.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDB();
