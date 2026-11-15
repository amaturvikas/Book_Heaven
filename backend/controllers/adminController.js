const jwt = require('jsonwebtoken');
const Admin = require('../models/Admin');
const User = require('../models/User');
const Book = require('../models/Book');
const Order = require('../models/Order');
const Rental = require('../models/Rental');
const Delivery = require('../models/Delivery');
const DeliveryBoy = require('../models/DeliveryBoy');
const { generateRandomToken, hashToken } = require('../utils/tokenGenerator');
const { sendEmail } = require('../utils/emailService');
const { getPasswordResetTemplate, getPasswordChangedTemplate } = require('../utils/emailTemplates');
const { buildPasswordResetUrls } = require('../utils/urlHelper');

const generateJwtToken = (admin) => {
  return jwt.sign(
    { id: admin._id, role: admin.role, authVersion: admin.authVersion },
    process.env.JWT_SECRET || 'super_secret_jwt_key_bookheaven_academic_project_2026',
    { expiresIn: '7d' }
  );
};

// @desc    Admin Login
// @route   POST /api/admin/login
// @access  Public
const adminLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() }).select('+password');
    if (!admin) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const isMatch = await admin.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid admin credentials.' });
    }

    const token = generateJwtToken(admin);

    res.status(200).json({
      success: true,
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Forgot Password
// @route   POST /api/admin/forgot-password
// @access  Public
const adminForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    const genericResponse = {
      success: true,
      message: 'If an eligible administrator account exists with that email, a password reset link has been dispatched.'
    };

    if (!admin) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);

    admin.passwordResetTokenHash = tokenHash;
    admin.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await admin.save();

    const resetUrls = buildPasswordResetUrls(req, 'admin', rawToken);

    await sendEmail({
      to: admin.email,
      subject: 'Admin Password Reset - Book Heaven',
      html: getPasswordResetTemplate(admin.name, resetUrls.primaryUrl, 'Administrator', {
        lanUrl: resetUrls.lanUrl,
        localUrl: resetUrls.localUrl,
        isProduction: resetUrls.isProduction
      })
    });

    res.status(200).json(genericResponse);
  } catch (error) {
    next(error);
  }
};

// @desc    Admin Reset Password
// @route   POST /api/admin/reset-password/:token
// @access  Public
const adminResetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password, confirmPassword } = req.body;

    if (!password || !confirmPassword) {
      return res.status(400).json({ success: false, message: 'Please enter and confirm your new password.' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ success: false, message: 'Passwords do not match.' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long.' });
    }

    const submittedHash = hashToken(token);

    const admin = await Admin.findOne({
      passwordResetTokenHash: submittedHash,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetTokenHash +passwordResetExpires');

    if (!admin) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid, expired, or has already been used.'
      });
    }

    admin.password = password;
    admin.passwordResetTokenHash = undefined;
    admin.passwordResetExpires = undefined;
    admin.authVersion += 1;
    await admin.save();

    await sendEmail({
      to: admin.email,
      subject: 'Admin Password Successfully Reset - Book Heaven',
      html: getPasswordChangedTemplate(admin.name, 'Administrator')
    });

    res.status(200).json({
      success: true,
      message: 'Admin password reset successfully. Please log in with your new credentials.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get Admin Dashboard KPI metrics
// @route   GET /api/admin/dashboard
// @access  Private (Admin)
const getDashboardStats = async (req, res, next) => {
  try {
    const [
      totalUsers,
      totalBooks,
      totalOrders,
      totalRentals,
      activeRentals,
      totalDeliveryBoys,
      activeDeliveries,
      pendingReturnPickups
    ] = await Promise.all([
      User.countDocuments(),
      Book.countDocuments(),
      Order.countDocuments(),
      Rental.countDocuments(),
      Rental.countDocuments({ status: { $in: ['Active', 'Due', 'Overdue'] } }),
      DeliveryBoy.countDocuments(),
      Delivery.countDocuments({ status: { $in: ['Assigned', 'PickedUp', 'OutForDelivery'] } }),
      Delivery.countDocuments({ type: 'RentalReturnPickup', status: { $ne: 'Delivered' } })
    ]);

    // Calculate revenue
    const orders = await Order.find({ paymentStatus: 'Completed' }, 'totalAmount');
    const totalOrderRevenue = orders.reduce((acc, curr) => acc + (curr.totalAmount || 0), 0);

    const rentals = await Rental.find({ paymentStatus: 'Completed' }, 'totalPaid');
    const totalRentalRevenue = rentals.reduce((acc, curr) => acc + (curr.totalPaid || 0), 0);

    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('user', 'name email');

    const recentDeliveries = await Delivery.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('assignedDeliveryBoy', 'name phone employeeId');

    res.status(200).json({
      success: true,
      stats: {
        totalUsers,
        totalBooks,
        totalOrders,
        totalRentals,
        activeRentals,
        totalDeliveryBoys,
        activeDeliveries,
        pendingReturnPickups,
        totalRevenue: totalOrderRevenue + totalRentalRevenue
      },
      recentOrders,
      recentDeliveries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private (Admin)
const getUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: users.length,
      users
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  adminLogin,
  adminForgotPassword,
  adminResetPassword,
  getDashboardStats,
  getUsers
};
