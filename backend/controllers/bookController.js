const Book = require('../models/Book');

// @desc    Get all books with filtering, searching, sorting, and pagination
// @route   GET /api/books
// @access  Public
const getBooks = async (req, res, next) => {
  try {
    const { q, category, sort, page = 1, limit = 12, featured } = req.query;

    const query = {};

    if (q && q.trim()) {
      const searchTerm = q.trim();
      query.$or = [
        { title: { $regex: searchTerm, $options: 'i' } },
        { author: { $regex: searchTerm, $options: 'i' } },
        { isbn: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } }
      ];
    }

    if (category && category !== 'All') {
      query.category = { $regex: new RegExp(`^${category}$`, 'i') };
    }

    if (featured === 'true') {
      query.isFeatured = true;
    }

    let sortOption = { createdAt: -1 };
    if (sort === 'price-asc') {
      sortOption = { purchasePrice: 1 };
    } else if (sort === 'price-desc') {
      sortOption = { purchasePrice: -1 };
    } else if (sort === 'newest') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'popular') {
      sortOption = { totalStock: -1 };
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Book.countDocuments(query);
    const books = await Book.find(query).sort(sortOption).skip(skip).limit(limitNum);

    res.status(200).json({
      success: true,
      count: books.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      books
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single book details
// @route   GET /api/books/:id
// @access  Public
const getBookById = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }
    res.status(200).json({ success: true, book });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new book
// @route   POST /api/admin/books
// @access  Private (Admin)
const createBook = async (req, res, next) => {
  try {
    const {
      title,
      author,
      category,
      description,
      purchasePrice,
      rentalPricePerDay,
      totalStock,
      availableStock,
      isbn,
      publisher,
      publishedYear,
      isFeatured,
      coverImageUrl
    } = req.body;

    let coverImage = coverImageUrl;
    if (req.file) {
      coverImage = `/uploads/books/${req.file.filename}`;
    }

    if (!title || !author || !category || !purchasePrice || !rentalPricePerDay) {
      return res.status(400).json({
        success: false,
        message: 'Please provide title, author, category, purchase price, and rental price per day.'
      });
    }

    const initialTotalStock = parseInt(totalStock, 10) || 10;
    const initialAvailableStock = availableStock !== undefined ? parseInt(availableStock, 10) : initialTotalStock;

    const book = await Book.create({
      title,
      author,
      category,
      description: description || 'No description provided.',
      purchasePrice: parseFloat(purchasePrice),
      rentalPricePerDay: parseFloat(rentalPricePerDay),
      totalStock: initialTotalStock,
      availableStock: initialAvailableStock,
      coverImage: coverImage || 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=600',
      isbn: isbn || '',
      publisher: publisher || 'Book Heaven Publishing',
      publishedYear: parseInt(publishedYear, 10) || 2024,
      isFeatured: isFeatured === 'true' || isFeatured === true
    });

    res.status(201).json({
      success: true,
      message: 'Book created successfully.',
      book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update book details
// @route   PUT /api/admin/books/:id
// @access  Private (Admin)
const updateBook = async (req, res, next) => {
  try {
    let book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    const {
      title,
      author,
      category,
      description,
      purchasePrice,
      rentalPricePerDay,
      totalStock,
      availableStock,
      isbn,
      publisher,
      publishedYear,
      isFeatured,
      coverImageUrl
    } = req.body;

    if (title) book.title = title;
    if (author) book.author = author;
    if (category) book.category = category;
    if (description) book.description = description;
    if (purchasePrice !== undefined) book.purchasePrice = parseFloat(purchasePrice);
    if (rentalPricePerDay !== undefined) book.rentalPricePerDay = parseFloat(rentalPricePerDay);
    if (totalStock !== undefined) book.totalStock = parseInt(totalStock, 10);
    if (availableStock !== undefined) book.availableStock = parseInt(availableStock, 10);
    if (isbn !== undefined) book.isbn = isbn;
    if (publisher !== undefined) book.publisher = publisher;
    if (publishedYear !== undefined) book.publishedYear = parseInt(publishedYear, 10);
    if (isFeatured !== undefined) book.isFeatured = isFeatured === 'true' || isFeatured === true;

    if (req.file) {
      book.coverImage = `/uploads/books/${req.file.filename}`;
    } else if (coverImageUrl) {
      book.coverImage = coverImageUrl;
    }

    await book.save();

    res.status(200).json({
      success: true,
      message: 'Book updated successfully.',
      book
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete book
// @route   DELETE /api/admin/books/:id
// @access  Private (Admin)
const deleteBook = async (req, res, next) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found.' });
    }

    await Book.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Book deleted successfully from inventory.'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook
};
