const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  title: { type: String, required: true },
  author: { type: String, required: true },
  coverImage: { type: String, default: '' },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  total: { type: Number, required: true }
}, { _id: true });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: 'Delhi' },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  customerName: { type: String, required: true },
  customerPhone: { type: String, required: true },
  paymentMethod: {
    type: String,
    enum: ['COD', 'Razorpay'],
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['Pending', 'Completed', 'Failed', 'RefundPending'],
    default: 'Pending'
  },
  orderStatus: {
    type: String,
    enum: ['Placed', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'],
    default: 'Placed'
  },
  delivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery'
  },
  notes: {
    type: String,
    default: ''
  },
  cancellationReason: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ orderStatus: 1 });

module.exports = mongoose.model('Order', orderSchema);
