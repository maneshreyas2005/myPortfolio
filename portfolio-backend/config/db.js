require('dotenv').config();
const mongoose = require('mongoose');

const AtlasURL = process.env.MONGODB_URI || 'mongodb+srv://maneshreyas272_db_user:GjP7nrHrqoVKRE1b@cluster0.clhbqx1.mongodb.net/?appName=Cluster0';

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(AtlasURL);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Error: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;