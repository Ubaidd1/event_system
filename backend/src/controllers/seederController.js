const User = require('../models/User');
const Wedding = require('../models/Wedding');
const Family = require('../models/Family');
const Guest = require('../models/Guest');
const Event = require('../models/Event');
const Invitation = require('../models/Invitation');
const CheckIn = require('../models/CheckIn');
const Vendor = require('../models/Vendor');
const Expense = require('../models/Expense');
const ActivityLog = require('../models/ActivityLog');
const { generateQRCodeDataURL, generateSecureToken } = require('../utils/qrCodeGenerator');
const ApiResponse = require('../utils/apiResponse');
const asyncHandler = require('../utils/asyncHandler');

const seedDatabase = asyncHandler(async (req, res) => {
  // Clear existing demo data
  await User.deleteMany({ email: { $in: ['admin@shaadisphere.com', 'manager@shaadisphere.com', 'staff@shaadisphere.com'] } });
  await Wedding.deleteMany({});
  await Family.deleteMany({});
  await Guest.deleteMany({});
  await Event.deleteMany({});
  await Invitation.deleteMany({});
  await CheckIn.deleteMany({});
  await Vendor.deleteMany({});
  await Expense.deleteMany({});
  await ActivityLog.deleteMany({});

  // 1. Create Default Users with different roles
  const admin = await User.create({
    name: 'Abdullah Mansoor',
    email: 'admin@shaadisphere.com',
    password: 'password123',
    role: 'Admin'
  });

  const manager = await User.create({
    name: 'Sarah Khan',
    email: 'manager@shaadisphere.com',
    password: 'password123',
    role: 'Manager'
  });

  const staff = await User.create({
    name: 'Entrance Security Staff',
    email: 'staff@shaadisphere.com',
    password: 'password123',
    role: 'Staff'
  });

  // 2. Create Wedding
  const wedding = await Wedding.create({
    coupleNames: 'Abdullah & Sarah',
    title: 'Wedding Celebration',
    weddingDate: new Date('2027-03-19T18:00:00.000Z'),
    totalBudget: 60000,
    organizer: admin._id,
    currency: 'USD'
  });

  // 3. Create Events
  const nikkah = await Event.create({
    wedding: wedding._id,
    name: 'Nikkah Ceremony',
    date: new Date('2027-03-18T16:00:00.000Z'),
    startTime: '16:00',
    endTime: '19:00',
    venue: 'Faisal Mosque Courtyard',
    address: 'Shah Faisal Ave, Islamabad',
    description: 'Sacred Islamic marriage contract ceremony followed by traditional refreshments.',
    dressCode: 'Formal Traditional White & Gold'
  });

  const mehndi = await Event.create({
    wedding: wedding._id,
    name: 'Mehndi Night',
    date: new Date('2027-03-18T20:00:00.000Z'),
    startTime: '20:00',
    endTime: '23:30',
    venue: 'Royal Palm Marquee',
    address: 'Club Road, Islamabad',
    description: 'Festive henna application, music, dances, and dholak celebrations.',
    dressCode: 'Vibrant Yellow & Green'
  });

  const baraat = await Event.create({
    wedding: wedding._id,
    name: 'Grand Baraat',
    date: new Date('2027-03-19T18:00:00.000Z'),
    startTime: '18:00',
    endTime: '23:00',
    venue: 'Serena Grand Ballroom',
    address: 'Khayaban-e-Suhrawardy, Islamabad',
    description: 'Main wedding procession reception, dinner, and bride farewell ceremony.',
    dressCode: 'Royal Formal Ethnic'
  });

  const walima = await Event.create({
    wedding: wedding._id,
    name: 'Walima Banquet',
    date: new Date('2027-03-20T19:00:00.000Z'),
    startTime: '19:00',
    endTime: '22:30',
    venue: 'Marriott Crystal Hall',
    address: 'Agha Khan Rd, Islamabad',
    description: 'Groom family post-wedding celebratory feast with extended family and friends.',
    dressCode: 'Pastel Elegance / Suits'
  });

  // 4. Create Families
  const mansoorFamily = await Family.create({
    wedding: wedding._id,
    name: 'Mansoor Family',
    headContact: 'Tariq Mansoor',
    phone: '+92 300 1234567',
    email: 'mansoor.family@example.com',
    notes: 'Groom immediate family circle'
  });

  const khanFamily = await Family.create({
    wedding: wedding._id,
    name: 'Khan Family',
    headContact: 'General Aslam Khan',
    phone: '+92 300 7654321',
    email: 'khan.family@example.com',
    notes: 'Bride immediate family circle'
  });

  // 5. Create Guests
  const g1 = await Guest.create({
    wedding: wedding._id,
    family: mansoorFamily._id,
    name: 'Tariq Mansoor',
    email: 'tariq.mansoor@example.com',
    phone: '+92 300 1234567',
    category: 'Groom Family',
    allowedPlusOnes: 3,
    plusOnesAssigned: 3,
    rsvpStatus: 'Confirmed',
    events: [nikkah._id, mehndi._id, baraat._id, walima._id]
  });

  const g2 = await Guest.create({
    wedding: wedding._id,
    family: khanFamily._id,
    name: 'Aslam Khan',
    email: 'aslam.khan@example.com',
    phone: '+92 300 7654321',
    category: 'Bride Family',
    allowedPlusOnes: 4,
    plusOnesAssigned: 4,
    rsvpStatus: 'Confirmed',
    events: [nikkah._id, mehndi._id, baraat._id, walima._id]
  });

  const g3 = await Guest.create({
    wedding: wedding._id,
    name: 'Dr. Faisal Hashmi',
    email: 'faisal.hashmi@example.com',
    phone: '+92 321 5558899',
    category: 'VIP',
    allowedPlusOnes: 1,
    plusOnesAssigned: 1,
    rsvpStatus: 'Confirmed',
    events: [baraat._id, walima._id]
  });

  const g4 = await Guest.create({
    wedding: wedding._id,
    name: 'Ayesha Rahman',
    email: 'ayesha.r@example.com',
    phone: '+92 333 4443322',
    category: 'Bride Friend',
    allowedPlusOnes: 1,
    plusOnesAssigned: 1,
    rsvpStatus: 'Pending',
    events: [mehndi._id, baraat._id]
  });

  const g5 = await Guest.create({
    wedding: wedding._id,
    name: 'Bilal Ahmed',
    email: 'bilal.a@example.com',
    phone: '+92 312 9988776',
    category: 'Groom Friend',
    allowedPlusOnes: 1,
    plusOnesAssigned: 0,
    rsvpStatus: 'Declined',
    events: [valima => walima._id]
  });

  // 6. Create Invitations & Secure QR Codes
  const token1 = 'INV-8F72A9C1';
  const qrUrl1 = await generateQRCodeDataURL(token1);
  const inv1 = await Invitation.create({
    wedding: wedding._id,
    guest: g1._id,
    family: mansoorFamily._id,
    secureToken: token1,
    templateStyle: 'Royal Gold',
    title: 'Together with their families',
    customMessage: 'Request the pleasure of your company to celebrate the auspicious union of Abdullah & Sarah.',
    qrCodeUrl: qrUrl1
  });

  const token2 = 'INV-9K41B8X2';
  const qrUrl2 = await generateQRCodeDataURL(token2);
  const inv2 = await Invitation.create({
    wedding: wedding._id,
    guest: g2._id,
    family: khanFamily._id,
    secureToken: token2,
    templateStyle: 'Modern Ivory',
    title: 'Wedding Celebration Invitation',
    customMessage: 'Join us as Abdullah & Sarah begin their lifelong journey of togetherness.',
    qrCodeUrl: qrUrl2
  });

  const token3 = 'INV-3M19C5Z7';
  const qrUrl3 = await generateQRCodeDataURL(token3);
  await Invitation.create({
    wedding: wedding._id,
    guest: g3._id,
    secureToken: token3,
    templateStyle: 'Velvet Rose',
    title: 'VIP Guest Invitation',
    customMessage: 'We request your presence at our wedding reception.',
    qrCodeUrl: qrUrl3
  });

  // 7. Create Demo Check-In record
  await CheckIn.create({
    wedding: wedding._id,
    invitation: inv1._id,
    event: nikkah._id,
    guest: g1._id,
    family: mansoorFamily._id,
    attendeesCount: 4,
    scannedBy: staff._id,
    scannedAt: new Date(Date.now() - 3600000),
    status: 'Verified',
    notes: 'Primary groom family checked in at entrance'
  });

  // 8. Create Vendors
  const v1 = await Vendor.create({
    wedding: wedding._id,
    name: 'Serena Grand Catering & Hospitality',
    category: 'Catering',
    phone: '+92 51 111 133 133',
    email: 'events@serena.com',
    contractAmount: 25000,
    amountPaid: 15000,
    dueDate: new Date('2027-03-15'),
    paymentStatus: 'Partially Paid',
    notes: 'Covers buffet dinner for 400 guests at Baraat'
  });

  const v2 = await Vendor.create({
    wedding: wedding._id,
    name: 'Royal Palm Marquee Venue',
    category: 'Venue',
    phone: '+92 51 289 0011',
    email: 'booking@royalpalm.pk',
    contractAmount: 12000,
    amountPaid: 12000,
    paymentStatus: 'Paid',
    notes: 'Hall rental for Mehndi Night'
  });

  const v3 = await Vendor.create({
    wedding: wedding._id,
    name: 'Lumière Fine Art Wedding Photography',
    category: 'Photography',
    phone: '+92 300 8877665',
    email: 'contact@lumiere.pk',
    contractAmount: 5000,
    amountPaid: 2500,
    dueDate: new Date('2027-03-21'),
    paymentStatus: 'Partially Paid',
    notes: 'Full 3-day coverage with cinematic drone highlights'
  });

  const v4 = await Vendor.create({
    wedding: wedding._id,
    name: 'Flora Design Studio & Stage Setup',
    category: 'Decoration',
    phone: '+92 321 4455667',
    email: 'flora@designstudio.com',
    contractAmount: 8000,
    amountPaid: 0,
    dueDate: new Date('2027-03-10'),
    paymentStatus: 'Pending',
    notes: 'Fresh flower stage and floral walkway decorations'
  });

  // 9. Create Expenses
  await Expense.create({
    wedding: wedding._id,
    title: 'Serena Catering Advance Deposit',
    category: 'Catering',
    vendor: v1._id,
    amount: 15000,
    paymentStatus: 'Paid',
    paymentDate: new Date('2027-02-10'),
    notes: '60% advance payment for main banquet'
  });

  await Expense.create({
    wedding: wedding._id,
    title: 'Royal Palm Full Booking Payment',
    category: 'Venue',
    vendor: v2._id,
    amount: 12000,
    paymentStatus: 'Paid',
    paymentDate: new Date('2027-02-01'),
    notes: 'Full venue payment'
  });

  await Expense.create({
    wedding: wedding._id,
    title: 'Photography Booking Deposit',
    category: 'Photography',
    vendor: v3._id,
    amount: 2500,
    paymentStatus: 'Paid',
    paymentDate: new Date('2027-02-15')
  });

  await Expense.create({
    wedding: wedding._id,
    title: 'Custom Gold Embossed Invitations',
    category: 'Invitations',
    amount: 1800,
    paymentStatus: 'Paid',
    paymentDate: new Date('2027-02-20'),
    notes: 'Physical cards printing'
  });

  // 10. Activity Logs
  await ActivityLog.create({
    wedding: wedding._id,
    user: admin._id,
    userName: admin.name,
    userRole: admin.role,
    action: 'Initialized Wedding',
    entityType: 'Wedding',
    details: 'Admin configured Abdullah & Sarah Wedding Celebration'
  });

  await ActivityLog.create({
    wedding: wedding._id,
    user: manager._id,
    userName: manager.name,
    userRole: manager.role,
    action: 'Generated Invitations',
    entityType: 'Invitation',
    details: 'Manager created QR invitations for Mansoor Family and Khan Family'
  });

  await ActivityLog.create({
    wedding: wedding._id,
    user: staff._id,
    userName: staff.name,
    userRole: staff.role,
    action: 'Entrance Check-In',
    entityType: 'CheckIn',
    details: 'Staff checked in Mansoor Family (4 attendees) at Nikkah Ceremony'
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        wedding,
        accounts: [
          { role: 'Admin', email: 'admin@shaadisphere.com', password: 'password123' },
          { role: 'Manager', email: 'manager@shaadisphere.com', password: 'password123' },
          { role: 'Staff', email: 'staff@shaadisphere.com', password: 'password123' }
        ],
        sampleTokens: [token1, token2, token3]
      },
      'Database seeded successfully with rich realistic wedding demo data'
    )
  );
});

module.exports = {
  seedDatabase
};
