const crypto = require('crypto');
const Razorpay = require('razorpay');
const Payment = require('../models/Payment');
const Order = require('../models/Order');
const Rental = require('../models/Rental');

const getRazorpayInstance = () => {
  if (
    process.env.RAZORPAY_KEY_ID &&
    process.env.RAZORPAY_KEY_ID.trim() !== '' &&
    process.env.RAZORPAY_KEY_SECRET &&
    process.env.RAZORPAY_KEY_SECRET.trim() !== ''
  ) {
    return new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }
  return null;
};

// @desc    Create Razorpay Order for checkout
// @route   POST /api/payments/create-order
// @access  Private (Customer)
const createPaymentOrder = async (req, res, next) => {
  try {
    const { amount, currency = 'INR', orderId, rentalId } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ success: false, message: 'Invalid payment amount.' });
    }

    const razorpay = getRazorpayInstance();
    if (!razorpay) {
      return res.status(200).json({
        success: false,
        razorpayEnabled: false,
        message: 'Razorpay test credentials are not configured in backend .env. Please select Cash on Delivery (COD) for testing.'
      });
    }

    const options = {
      amount: Math.round(amount * 100), // amount in lowest denomination (paise)
      currency,
      receipt: `rcpt_${Date.now()}`
    };

    const razorpayOrder = await razorpay.orders.create(options);

    res.status(200).json({
      success: true,
      razorpayEnabled: true,
      razorpayOrder: {
        id: razorpayOrder.id,
        amount: razorpayOrder.amount,
        currency: razorpayOrder.currency,
        keyId: process.env.RAZORPAY_KEY_ID
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Verify Razorpay payment signature
// @route   POST /api/payments/verify
// @access  Private (Customer)
const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      orderId,
      rentalId,
      amount
    } = req.body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Missing payment signature verification data.' });
    }

    const secret = process.env.RAZORPAY_KEY_SECRET;
    if (!secret) {
      return res.status(500).json({ success: false, message: 'Server payment configuration missing.' });
    }

    const generatedSignature = crypto
      .createHmac('sha256', secret)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest('hex');

    if (generatedSignature !== razorpay_signature) {
      return res.status(400).json({ success: false, message: 'Payment verification failed: Invalid signature.' });
    }

    // Signature verified! Record payment
    const transactionId = `TXN-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const payment = await Payment.create({
      transactionId,
      user: req.user._id,
      order: orderId || null,
      rental: rentalId || null,
      amount: amount || 0,
      method: 'Razorpay',
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
      status: 'Completed'
    });

    if (orderId) {
      await Order.findByIdAndUpdate(orderId, { paymentStatus: 'Completed' });
    }

    if (rentalId) {
      await Rental.findByIdAndUpdate(rentalId, { paymentStatus: 'Completed' });
    }

    res.status(200).json({
      success: true,
      message: 'Payment verified and captured successfully.',
      payment
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Razorpay Webhook Handler
// @route   POST /api/payments/webhook
// @access  Public
const razorpayWebhook = async (req, res, next) => {
  try {
    const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];

    if (secret && signature) {
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(JSON.stringify(req.body))
        .digest('hex');

      if (expectedSignature !== signature) {
        return res.status(400).json({ success: false, message: 'Invalid webhook signature.' });
      }
    }

    const event = req.body.event;
    console.log(`[RazorpayWebhook] Received event: ${event}`);

    // Idempotent webhook event processing
    if (event === 'payment.captured') {
      const paymentEntity = req.body.payload && req.body.payload.payment && req.body.payload.payment.entity;
      if (paymentEntity) {
        const existing = await Payment.findOne({ razorpayPaymentId: paymentEntity.id });
        if (!existing) {
          await Payment.create({
            transactionId: `TXN-WH-${Date.now()}`,
            user: paymentEntity.notes && paymentEntity.notes.userId ? paymentEntity.notes.userId : null,
            amount: paymentEntity.amount / 100,
            method: 'Razorpay',
            razorpayOrderId: paymentEntity.order_id,
            razorpayPaymentId: paymentEntity.id,
            status: 'Completed'
          });
        }
      }
    }

    res.status(200).json({ status: 'ok' });
  } catch (error) {
    next(error);
  }
};

// @desc    Get payment status by ID
// @route   GET /api/payments/:id/status
// @access  Private
const getPaymentStatus = async (req, res, next) => {
  try {
    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res.status(404).json({ success: false, message: 'Payment record not found.' });
    }
    res.status(200).json({ success: true, payment });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all payments for Admin audit
// @route   GET /api/admin/payments
// @access  Private (Admin)
const getAllPaymentsAdmin = async (req, res, next) => {
  try {
    const payments = await Payment.find()
      .sort({ createdAt: -1 })
      .populate('user', 'name email phone')
      .populate('order', 'orderNumber totalAmount')
      .populate('rental', 'rentalNumber totalPaid');

    res.status(200).json({
      success: true,
      count: payments.length,
      payments
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPaymentOrder,
  verifyPayment,
  razorpayWebhook,
  getPaymentStatus,
  getAllPaymentsAdmin
};
