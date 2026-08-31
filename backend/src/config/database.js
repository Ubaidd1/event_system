const mongoose = require('mongoose');

let isConnected = false;

const connectDB = async () => {
  if (mongoose.connection.readyState >= 1 || isConnected) {
    return;
  }

  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shaadisphere');
    isConnected = !!conn.connections[0].readyState;
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    throw error;
  }
};

module.exports = connectDB;
