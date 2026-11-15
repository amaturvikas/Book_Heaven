const jwt = require('jsonwebtoken');
const DeliveryBoy = require('../models/DeliveryBoy');
const { generateRandomToken, hashToken } = require('../utils/tokenGenerator');
const { sendEmail } = require('../utils/emailService');
const { getPasswordResetTemplate, getPasswordChangedTemplate } = require('../utils/emailTemplates');
const { buildPasswordResetUrls } = require('../utils/urlHelper');

const generateJwtToken = (deliveryBoy) => {
  return jwt.sign(
    { id: deliveryBoy._id, role: deliveryBoy.role, authVersion: deliveryBoy.authVersion },
    process.env.JWT_SECRET || 'super_secret_jwt_key_bookheaven_academic_project_2026',
    { expiresIn: '7d' }
  );
};

// @desc    Delivery Boy Login
// @route   POST /api/delivery-boy/login
// @access  Public
const deliveryBoyLogin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide email and password.' });
    }

    const deliveryBoy = await DeliveryBoy.findOne({ email: email.toLowerCase() }).select('+password');
    if (!deliveryBoy) {
      return res.status(401).json({ success: false, message: 'Invalid delivery personnel credentials.' });
    }

    if (deliveryBoy.status === 'Inactive') {
      return res.status(403).json({
        success: false,
        message: 'Your account has been deactivated. Please contact the administrator.'
      });
    }

    const isMatch = await deliveryBoy.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid delivery personnel credentials.' });
    }

    const token = generateJwtToken(deliveryBoy);

    res.status(200).json({
      success: true,
      token,
      deliveryBoy: {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        email: deliveryBoy.email,
        phone: deliveryBoy.phone,
        employeeId: deliveryBoy.employeeId,
        vehicleDetails: deliveryBoy.vehicleDetails,
        status: deliveryBoy.status,
        role: deliveryBoy.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delivery Boy Forgot Password
// @route   POST /api/delivery-boy/forgot-password
// @access  Public
const deliveryBoyForgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    }

    const deliveryBoy = await DeliveryBoy.findOne({ email: email.toLowerCase() });
    const genericResponse = {
      success: true,
      message: 'If an eligible delivery personnel account exists with that email, a password reset link has been dispatched.'
    };

    if (!deliveryBoy || deliveryBoy.status === 'Inactive') {
      return res.status(200).json(genericResponse);
    }

    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);

    deliveryBoy.passwordResetTokenHash = tokenHash;
    deliveryBoy.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await deliveryBoy.save();

    const resetUrls = buildPasswordResetUrls(req, 'delivery-boy', rawToken);

    await sendEmail({
      to: deliveryBoy.email,
      subject: 'Delivery Personnel Password Reset - Book Heaven',
      html: getPasswordResetTemplate(deliveryBoy.name, resetUrls.primaryUrl, 'Delivery Boy', {
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

// @desc    Delivery Boy Reset Password
// @route   POST /api/delivery-boy/reset-password/:token
// @access  Public
const deliveryBoyResetPassword = async (req, res, next) => {
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

    const deliveryBoy = await DeliveryBoy.findOne({
      passwordResetTokenHash: submittedHash,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetTokenHash +passwordResetExpires');

    if (!deliveryBoy) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid, expired, or has already been used.'
      });
    }

    deliveryBoy.password = password;
    deliveryBoy.passwordResetTokenHash = undefined;
    deliveryBoy.passwordResetExpires = undefined;
    deliveryBoy.authVersion += 1;
    await deliveryBoy.save();

    await sendEmail({
      to: deliveryBoy.email,
      subject: 'Password Reset Successful - Book Heaven Delivery',
      html: getPasswordChangedTemplate(deliveryBoy.name, 'Delivery Personnel')
    });

    res.status(200).json({
      success: true,
      message: 'Password reset successfully. Please log in with your new credentials.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delivery Boy Logout
// @route   POST /api/delivery-boy/logout
// @access  Public
const deliveryBoyLogout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Delivery personnel logged out successfully.'
  });
};

// @desc    Get current Delivery Boy profile
// @route   GET /api/delivery-boy/me
// @access  Private (DeliveryBoy)
const getDeliveryBoyMe = async (req, res, next) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.user._id);
    res.status(200).json({
      success: true,
      deliveryBoy: {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        email: deliveryBoy.email,
        phone: deliveryBoy.phone,
        employeeId: deliveryBoy.employeeId,
        address: deliveryBoy.address,
        vehicleDetails: deliveryBoy.vehicleDetails,
        status: deliveryBoy.status,
        role: deliveryBoy.role
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update Delivery Boy profile
// @route   PUT /api/delivery-boy/profile
// @access  Private (DeliveryBoy)
const updateDeliveryBoyProfile = async (req, res, next) => {
  try {
    const { phone, address, vehicleDetails } = req.body;
    const deliveryBoy = await DeliveryBoy.findById(req.user._id);

    if (phone) deliveryBoy.phone = phone;
    if (address !== undefined) deliveryBoy.address = address;
    if (vehicleDetails) {
      if (vehicleDetails.vehicleType) deliveryBoy.vehicleDetails.vehicleType = vehicleDetails.vehicleType;
      if (vehicleDetails.vehicleNumber !== undefined) deliveryBoy.vehicleDetails.vehicleNumber = vehicleDetails.vehicleNumber;
    }

    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      deliveryBoy
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  deliveryBoyLogin,
  deliveryBoyForgotPassword,
  deliveryBoyResetPassword,
  deliveryBoyLogout,
  getDeliveryBoyMe,
  updateDeliveryBoyProfile
};
