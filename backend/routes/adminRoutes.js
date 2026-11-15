const express = require('express');
const router = express.Router();
const {
  adminLogin,
  adminForgotPassword,
  adminResetPassword,
  getDashboardStats,
  getUsers
} = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { authRateLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

router.post('/login', authRateLimiter, adminLogin);
router.post('/forgot-password', passwordResetLimiter, adminForgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, adminResetPassword);
router.get('/dashboard', authenticate, authorize('admin'), getDashboardStats);
router.get('/users', authenticate, authorize('admin'), getUsers);

module.exports = router;
