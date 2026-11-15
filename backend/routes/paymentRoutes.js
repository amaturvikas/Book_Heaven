const express = require('express');
const router = express.Router();
const {
  createPaymentOrder,
  verifyPayment,
  razorpayWebhook,
  getPaymentStatus,
  getAllPaymentsAdmin
} = require('../controllers/paymentController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/create-order', authenticate, authorize('customer'), createPaymentOrder);
router.post('/verify', authenticate, authorize('customer'), verifyPayment);
router.post('/webhook', razorpayWebhook);
router.get('/:id/status', authenticate, getPaymentStatus);
router.get('/admin/all', authenticate, authorize('admin'), getAllPaymentsAdmin);

module.exports = router;
