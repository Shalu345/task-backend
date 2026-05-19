const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      console.error('================================================================');
      console.error('CRITICAL ERROR: MONGO_URI environment variable is not defined!');
      console.error('Please configure MONGO_URI in your Render Environment settings.');
      console.error('================================================================');
      process.exit(1);
    }
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('================================================================');
    console.error(`MongoDB Connection Error: ${error.message}`);
    console.error('Please verify your MONGO_URI connection string is correct and valid.');
    console.error('================================================================');
    process.exit(1);
  }
};

module.exports = connectDB;
