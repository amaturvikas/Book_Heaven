const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  book: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Book',
    required: true
  },
  itemType: {
    type: String,
    enum: ['buy', 'rent'],
    default: 'buy',
    required: true
  },
  rentalDays: {
    type: Number,
    min: 1,
    max: 90,
    default: 7
  },
  quantity: {
    type: Number,
    required: true,
    min: 1,
    default: 1
  },
  priceSnapshot: {
    type: Number,
    required: true
  }
}, { _id: true });

const cartSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  items: [cartItemSchema]
}, {
  timestamps: true
});

module.exports = mongoose.model('Cart', cartSchema);
