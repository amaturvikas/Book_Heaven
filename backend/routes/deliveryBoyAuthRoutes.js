const express = require('express');
const router = express.Router();
const {
  deliveryBoyLogin,
  deliveryBoyForgotPassword,
  deliveryBoyResetPassword,
  deliveryBoyLogout,
  getDeliveryBoyMe,
  updateDeliveryBoyProfile
} = require('../controllers/deliveryBoyAuthController');
const { authenticate, authorize } = require('../middleware/auth');
const { authRateLimiter, passwordResetLimiter } = require('../middleware/rateLimiter');

router.post('/login', authRateLimiter, deliveryBoyLogin);
router.post('/forgot-password', passwordResetLimiter, deliveryBoyForgotPassword);
router.post('/reset-password/:token', passwordResetLimiter, deliveryBoyResetPassword);
router.post('/logout', deliveryBoyLogout);
router.get('/me', authenticate, authorize('deliveryBoy'), getDeliveryBoyMe);
router.put('/profile', authenticate, authorize('deliveryBoy'), updateDeliveryBoyProfile);

module.exports = router;
