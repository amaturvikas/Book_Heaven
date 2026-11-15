const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generateRandomToken, hashToken } = require('../utils/tokenGenerator');
const { sendEmail } = require('../utils/emailService');
const { getPasswordResetTemplate, getPasswordChangedTemplate } = require('../utils/emailTemplates');
const { buildPasswordResetUrls } = require('../utils/urlHelper');

const generateJwtToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role, authVersion: user.authVersion },
    process.env.JWT_SECRET || 'super_secret_jwt_key_bookheaven_academic_project_2026',
    { expiresIn: '7d' }
  );
};

// @desc    Register a new customer
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide name, email, and password.' });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'An account with this email address already exists.' });
    }

    const initialAddresses = [];
    if (address && address.street && address.city) {
      initialAddresses.push({
        street: address.street,
        city: address.city,
        state: address.state || 'Delhi',
        zipCode: address.zipCode || '110001',
        country: address.country || 'India',
        isDefault: true
      });
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      phone: phone || '',
      addresses: initialAddresses
    });

    const token = generateJwtToken(user);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login customer
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password.' });
    }

    const token = generateJwtToken(user);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout customer
// @route   POST /api/auth/logout
// @access  Public
const logout = async (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
};

// @desc    Get current customer profile
// @route   GET /api/auth/me
// @access  Private (Customer)
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer profile
// @route   PUT /api/auth/profile
// @access  Private (Customer)
const updateProfile = async (req, res, next) => {
  try {
    const { name, phone, addresses } = req.body;
    const user = await User.findById(req.user._id);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (addresses && Array.isArray(addresses)) user.addresses = addresses;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully.',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        addresses: user.addresses
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Change password
// @route   PUT /api/auth/change-password
// @access  Private (Customer)
const changePassword = async (req, res, next) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ success: false, message: 'Please provide both your old and new password.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: 'New password must be at least 6 characters long.' });
    }

    const user = await User.findById(req.user._id).select('+password');
    const isMatch = await user.matchPassword(oldPassword);
    if (!isMatch) {
      return res.status(400).json({ success: false, message: 'Current password is incorrect.' });
    }

    user.password = newPassword;
    user.authVersion += 1; // Invalidate older sessions
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Password Changed Confirmation - Book Heaven',
      html: getPasswordChangedTemplate(user.name, 'Customer')
    });

    const newToken = generateJwtToken(user);

    res.status(200).json({
      success: true,
      message: 'Password changed successfully.',
      token: newToken
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password request
// @route   POST /api/auth/forgot-password
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, message: 'Please provide an email address.' });
    }

    const user = await User.findOne({ email: email.toLowerCase() });

    // Always respond with a generic success message to prevent user enumeration
    const genericResponse = {
      success: true,
      message: 'If an eligible account exists for that email, a password reset link has been dispatched.'
    };

    if (!user) {
      return res.status(200).json(genericResponse);
    }

    const rawToken = generateRandomToken();
    const tokenHash = hashToken(rawToken);

    // 15 minutes expiry
    user.passwordResetTokenHash = tokenHash;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    const resetUrls = buildPasswordResetUrls(req, '', rawToken);

    await sendEmail({
      to: user.email,
      subject: 'Password Reset Request - Book Heaven',
      html: getPasswordResetTemplate(user.name, resetUrls.primaryUrl, 'Customer', {
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

// @desc    Reset password using token
// @route   POST /api/auth/reset-password/:token
// @access  Public
const resetPassword = async (req, res, next) => {
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

    const user = await User.findOne({
      passwordResetTokenHash: submittedHash,
      passwordResetExpires: { $gt: Date.now() }
    }).select('+passwordResetTokenHash +passwordResetExpires');

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Password reset token is invalid, expired, or has already been used.'
      });
    }

    // Set new password
    user.password = password;
    user.passwordResetTokenHash = undefined;
    user.passwordResetExpires = undefined;
    user.authVersion += 1; // Invalidate all prior JWT sessions
    await user.save();

    await sendEmail({
      to: user.email,
      subject: 'Password Successfully Reset - Book Heaven',
      html: getPasswordChangedTemplate(user.name, 'Customer')
    });

    res.status(200).json({
      success: true,
      message: 'Password has been reset successfully. You may now log in with your new credentials.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword
};
