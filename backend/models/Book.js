const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Book title is required'],
    trim: true
  },
  author: {
    type: String,
    required: [true, 'Author name is required'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Description is required']
  },
  purchasePrice: {
    type: Number,
    required: [true, 'Purchase price is required'],
    min: [0, 'Purchase price must be positive']
  },
  rentalPricePerDay: {
    type: Number,
    required: [true, 'Rental price per day is required'],
    min: [0, 'Rental price must be positive']
  },
  totalStock: {
    type: Number,
    required: [true, 'Total stock is required'],
    min: [0, 'Total stock cannot be negative']
  },
  availableStock: {
    type: Number,
    required: [true, 'Available stock is required'],
    min: [0, 'Available stock cannot be negative']
  },
  coverImage: {
    type: String,
    default: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600'
  },
  isbn: {
    type: String,
    trim: true,
    default: ''
  },
  publisher: {
    type: String,
    trim: true,
    default: 'Book Heaven Publishing'
  },
  publishedYear: {
    type: Number,
    default: 2024
  },
  isFeatured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

bookSchema.index({ title: 'text', author: 'text' });
bookSchema.index({ category: 1 });
bookSchema.index({ purchasePrice: 1 });
bookSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Book', bookSchema);
