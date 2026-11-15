const mongoose = require('mongoose');

const deliveryTimelineSchema = new mongoose.Schema({
  status: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  actor: {
    id: { type: mongoose.Schema.Types.ObjectId },
    role: { type: String, required: true },
    name: { type: String, required: true }
  },
  notes: {
    type: String,
    default: ''
  },
  failureReason: {
    type: String,
    default: ''
  }
}, { _id: true });

const deliverySchema = new mongoose.Schema({
  deliveryNumber: {
    type: String,
    required: true,
    unique: true
  },
  type: {
    type: String,
    enum: ['Purchase', 'RentalDelivery', 'RentalReturnPickup'],
    required: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  rental: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Rental'
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  assignedDeliveryBoy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DeliveryBoy'
  },
  customerName: {
    type: String,
    required: true
  },
  customerPhone: {
    type: String,
    required: true
  },
  pickupLocation: {
    type: String,
    default: 'Book Heaven Central Fulfillment Center, Connaught Place, New Delhi - 110001'
  },
  deliveryAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, default: 'Delhi' },
    zipCode: { type: String, required: true },
    country: { type: String, default: 'India' }
  },
  deliveryInstructions: {
    type: String,
    default: ''
  },
  items: [{
    title: { type: String, required: true },
    quantity: { type: Number, required: true },
    book: { type: mongoose.Schema.Types.ObjectId, ref: 'Book' }
  }],
  status: {
    type: String,
    enum: [
      'PendingAssignment',
      'Assigned',
      'PickedUp',
      'OutForDelivery',
      'Delivered',
      'Failed',
      'Cancelled'
    ],
    default: 'PendingAssignment'
  },
  assignmentTimestamp: { type: Date },
  pickedUpTimestamp: { type: Date },
  outForDeliveryTimestamp: { type: Date },
  deliveredTimestamp: { type: Date },
  failedTimestamp: { type: Date },
  failureReason: { type: String, default: '' },
  deliveryNotes: { type: String, default: '' },
  proofOfDelivery: {
    recipientName: { type: String, default: '' },
    notes: { type: String, default: '' },
    timestamp: { type: Date }
  },
  timeline: [deliveryTimelineSchema]
}, {
  timestamps: true
});

deliverySchema.index({ assignedDeliveryBoy: 1, status: 1 });
deliverySchema.index({ customer: 1 });
deliverySchema.index({ status: 1 });
deliverySchema.index({ createdAt: -1 });

module.exports = mongoose.model('Delivery', deliverySchema);
