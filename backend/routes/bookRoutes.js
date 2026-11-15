const express = require('express');
const router = express.Router();
const {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
} = require('../controllers/bookController');
const { authenticate, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Public book routes
router.get('/', getBooks);
router.get('/:id', getBookById);

// Admin book management routes (when mounted on /api/admin/books or /api/books)
router.post('/', authenticate, authorize('admin'), upload.single('coverImage'), createBook);
router.put('/:id', authenticate, authorize('admin'), upload.single('coverImage'), updateBook);
router.delete('/:id', authenticate, authorize('admin'), deleteBook);

module.exports = router;
