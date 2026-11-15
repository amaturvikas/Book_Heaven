const mongoose = require('mongoose');

const rentalSchema = new mongoose.Schema({
  rentalNumber: {
    type: String,
    required: true,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  bookSnapshot: {
    title: { type: String, required: true },
    author: { type: String, required: true },
    coverImage: { type: String, default: '' },
    rentalPricePerDay: { type: Number, required: true }
  },
  rentalDays: {
    type: Number,
    required: true,
    min: 1
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  dailyFee: {
    type: Number,
    required: true
  },
  totalFee: {
    type: Number,
    required: true
  },
  deposit: {
    type: Number,
    default: 0
  },
  totalPaid: {
    type: Number,
    required: true
  },
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
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
  startDate: {
    type: Date
  },
  dueDate: {
    type: Date
  },
  returnDate: {
    type: Date
  },
  status: {
    type: String,
    enum: [
      'PendingDelivery',
      'Active',
      'Due',
      'Overdue',
      'ReturnScheduled',
      'ReturnCollected',
      'Returned',
      'Cancelled'
    ],
    default: 'PendingDelivery'
  },
  returnMethod: {
    type: String,
    enum: ['PickupRequired', 'CustomerReturnsToStore'],
    default: 'PickupRequired'
  },
  delivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery'
  },
  returnDelivery: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Delivery'
  },
  stockRestored: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

rentalSchema.index({ user: 1, createdAt: -1 });
rentalSchema.index({ status: 1 });
rentalSchema.index({ dueDate: 1 });

module.exports = mongoose.model('Rental', rentalSchema);
