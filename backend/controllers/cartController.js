const Cart = require('../models/Cart');
const Book = require('../models/Book');

// @desc    Get current user's shopping cart
// @route   GET /api/cart
// @access  Private (Customer)
const getCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id }).populate({
      path: 'items.book',
      select: 'title author category purchasePrice rentalPricePerDay availableStock coverImage totalStock'
    });

    if (!cart) {
      cart = await Cart.create({ user: req.user._id, items: [] });
    }

    // Filter out items whose books were deleted
    const validItems = cart.items.filter(item => item.book != null);
    if (validItems.length !== cart.items.length) {
      cart.items = validItems;
      await cart.save();
    }

    res.status(200).json({
      success: true,
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add item to cart
// @route   POST /api/cart
// @access  Private (Customer)
const addToCart = async (req, res, next) => {
  try {
    const { bookId, itemType = 'buy', rentalDays = 7, quantity = 1 } = req.body;

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Please provide a valid bookId.' });
    }

    const book = await Book.findById(bookId);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book not found in inventory.' });
    }

    const qty = parseInt(quantity, 10) || 1;
    if (qty > book.availableStock) {
      return res.status(400).json({
        success: false,
        message: `Only ${book.availableStock} copy/copies available in stock.`
      });
    }

    const days = Math.max(1, parseInt(rentalDays, 10) || 7);
    const unitPrice = itemType === 'rent' ? book.rentalPricePerDay * days : book.purchasePrice;

    let cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      cart = new Cart({ user: req.user._id, items: [] });
    }

    // Check if the same book with the same itemType and same rental duration is already in cart
    const existingIndex = cart.items.findIndex(
      item => item.book.toString() === bookId && item.itemType === itemType && (itemType === 'buy' || item.rentalDays === days)
    );

    if (existingIndex > -1) {
      const newTotalQty = cart.items[existingIndex].quantity + qty;
      if (newTotalQty > book.availableStock) {
        return res.status(400).json({
          success: false,
          message: `Cannot add more. Total in cart exceeds available stock (${book.availableStock}).`
        });
      }
      cart.items[existingIndex].quantity = newTotalQty;
      cart.items[existingIndex].priceSnapshot = unitPrice;
    } else {
      cart.items.push({
        book: book._id,
        itemType,
        rentalDays: days,
        quantity: qty,
        priceSnapshot: unitPrice
      });
    }

    await cart.save();
    await cart.populate({
      path: 'items.book',
      select: 'title author category purchasePrice rentalPricePerDay availableStock coverImage'
    });

    res.status(200).json({
      success: true,
      message: 'Item added to cart.',
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update cart item quantity or rental days
// @route   PUT /api/cart/:id
// @access  Private (Customer)
const updateCartItem = async (req, res, next) => {
  try {
    const { quantity, rentalDays } = req.body;
    const cart = await Cart.findOne({ user: req.user._id });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    const item = cart.items.id(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: 'Cart item not found.' });
    }

    const book = await Book.findById(item.book);
    if (!book) {
      return res.status(404).json({ success: false, message: 'Book no longer exists.' });
    }

    if (quantity !== undefined) {
      const newQty = parseInt(quantity, 10);
      if (newQty <= 0) {
        cart.items.pull(req.params.id);
      } else {
        if (newQty > book.availableStock) {
          return res.status(400).json({
            success: false,
            message: `Only ${book.availableStock} copies available in stock.`
          });
        }
        item.quantity = newQty;
      }
    }

    if (rentalDays !== undefined && item.itemType === 'rent') {
      const days = Math.max(1, parseInt(rentalDays, 10));
      item.rentalDays = days;
      item.priceSnapshot = book.rentalPricePerDay * days;
    }

    await cart.save();
    await cart.populate({
      path: 'items.book',
      select: 'title author category purchasePrice rentalPricePerDay availableStock coverImage'
    });

    res.status(200).json({
      success: true,
      message: 'Cart updated.',
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove single item from cart
// @route   DELETE /api/cart/:id
// @access  Private (Customer)
const removeCartItem = async (req, res, next) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found.' });
    }

    cart.items.pull(req.params.id);
    await cart.save();
    await cart.populate({
      path: 'items.book',
      select: 'title author category purchasePrice rentalPricePerDay availableStock coverImage'
    });

    res.status(200).json({
      success: true,
      message: 'Item removed from cart.',
      cart
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Clear all items in cart
// @route   DELETE /api/cart
// @access  Private (Customer)
const clearCart = async (req, res, next) => {
  try {
    let cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = [];
      await cart.save();
    }
    res.status(200).json({
      success: true,
      message: 'Cart cleared successfully.',
      cart: { user: req.user._id, items: [] }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getCart,
  addToCart,
  updateCartItem,
  removeCartItem,
  clearCart
};
