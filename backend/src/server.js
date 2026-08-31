const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = require('./config/database');
const errorHandler = require('./middleware/errorHandler');

// Route imports
const authRoutes = require('./routes/auth.routes');
const weddingRoutes = require('./routes/wedding.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const guestRoutes = require('./routes/guest.routes');
const familyRoutes = require('./routes/family.routes');
const eventRoutes = require('./routes/event.routes');
const invitationRoutes = require('./routes/invitation.routes');
const qrRoutes = require('./routes/qr.routes');
const checkinRoutes = require('./routes/checkin.routes');
const vendorRoutes = require('./routes/vendor.routes');
const expenseRoutes = require('./routes/expense.routes');
const budgetRoutes = require('./routes/budget.routes');
const reportRoutes = require('./routes/report.routes');
const activityRoutes = require('./routes/activity.routes');
const seedRoutes = require('./routes/seed.routes');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true
}));

app.use(express.json({ limit: '16kb' }));
app.use(express.urlencoded({ extended: true, limit: '16kb' }));
app.use(cookieParser());

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, '../public/uploads')));

// Healthcheck
app.get('/api/v1/health', (req, res) => {
  res.status(200).json({ success: true, message: 'ShaadiSphere API is active & healthy' });
});

// API v1 Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/wedding', weddingRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/guests', guestRoutes);
app.use('/api/v1/families', familyRoutes);
app.use('/api/v1/events', eventRoutes);
app.use('/api/v1/invitations', invitationRoutes);
app.use('/api/v1/qr', qrRoutes);
app.use('/api/v1/check-in', checkinRoutes);
app.use('/api/v1/vendors', vendorRoutes);
app.use('/api/v1/expenses', expenseRoutes);
app.use('/api/v1/budget', budgetRoutes);
app.use('/api/v1/reports', reportRoutes);
app.use('/api/v1/activity-logs', activityRoutes);
app.use('/api/v1/seed', seedRoutes);

// Global Centralized Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`[ShaadiSphere API] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});

module.exports = app;