const mongoose = require('mongoose');
require('dotenv').config(); // To load the environment variables

const connectDB = async () => {
  try {
    // Connect to MongoDB using the MONGODB_URI from the environment variables
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error: ${error.message}`);
    // Exit the process if there is a failure in connecting to MongoDB
    process.exit(1);
  }
};

module.exports = connectDB;
