require('dotenv').config();
const mongoose = require('mongoose');

const AtlasURL = process.env.MONGODB_URI || process.env.MONGO_URI;

const connectDB = async () => {
  try {
    if (!AtlasURL) {
      throw new Error('MONGODB_URI is not defined in environment variables');
    }
    const conn = await mongoose.connect(AtlasURL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;