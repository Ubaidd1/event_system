const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shaadisphere');
    console.log(`[Database] MongoDB Connected: ${conn.connection.host}`);
    console.log('[Application] Started');
  } catch (error) {
    console.error(`[Database Error] ${error.message}`);
    // Instead of exiting immediately in development if local mongo server isn't running, log warning
    console.warn('[Database] Note: Ensure MongoDB is running on MONGODB_URI or set up MongoDB Atlas string in .env');
  }
};

module.exports = connectDB;
