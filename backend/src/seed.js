require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');

const seedAdmin = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/shaadisphere';
    console.log('[Seed] Connecting to MongoDB...');
    await mongoose.connect(mongoUri);
    console.log('[Seed] MongoDB Connected.');

    const adminEmail = 'admin@gmail.com';
    const adminPassword = '1234567a-';

    let admin = await User.findOne({ email: adminEmail });

    if (admin) {
      console.log(`[Seed] Admin user (${adminEmail}) already exists. Updating password...`);
      admin.password = adminPassword;
      admin.role = 'Admin';
      await admin.save();
      console.log(`[Seed] Admin user password updated successfully.`);
    } else {
      console.log(`[Seed] Creating new Admin user (${adminEmail})...`);
      admin = await User.create({
        name: 'System Admin',
        email: adminEmail,
        password: adminPassword,
        role: 'Admin'
      });
      console.log(`[Seed] Admin user created successfully.`);
    }

    console.log('-----------------------------------');
    console.log('Admin Credentials:');
    console.log(`Email:    ${adminEmail}`);
    console.log(`Password: ${adminPassword}`);
    console.log(`Role:     ${admin.role}`);
    console.log('-----------------------------------');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error(`[Seed Error] ${error.message}`);
    process.exit(1);
  }
};

seedAdmin();
