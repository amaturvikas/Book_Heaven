const Rental = require('../models/Rental');
const Book = require('../models/Book');
const Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');
const Cart = require('../models/Cart');
const { sendEmail } = require('../utils/emailService');
const { getRentalConfirmationTemplate } = require('../utils/emailTemplates');

// @desc    Create a new book rental with atomic stock reservation
// @route   POST /api/rentals
// @access  Private (Customer)
const createRental = async (req, res, next) => {
  try {
    const { bookId, rentalDays = 7, quantity = 1, shippingAddress, paymentMethod = 'COD', notes } = req.body;

    if (!bookId) {
      return res.status(400).json({ success: false, message: 'Please provide a valid bookId.' });
    }

    const days = Math.max(1, parseInt(rentalDays, 10) || 7);
    const qty = Math.max(1, parseInt(quantity, 10) || 1);

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({ success: false, message: 'Please provide a valid delivery address.' });
    }

    // Atomic stock check and deduction
    const book = await Book.findOneAndUpdate(
      { _id: bookId, availableStock: { $gte: qty } },
      { $inc: { availableStock: -qty } },
      { new: true }
    );

    if (!book) {
      const targetBook = await Book.findById(bookId);
      const title = targetBook ? targetBook.title : 'Book';
      const available = targetBook ? targetBook.availableStock : 0;
      return res.status(400).json({
        success: false,
        message: `Insufficient stock to rent "${title}". Available: ${available}, requested: ${qty}.`
      });
    }

    const dailyFee = book.rentalPricePerDay;
    const totalFee = dailyFee * days * qty;
    const deposit = 0; // Configurable security deposit
    const totalPaid = totalFee + deposit;

    const rentalNumber = `RNT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const rental = await Rental.create({
      rentalNumber,
      user: req.user._id,
      book: book._id,
      bookSnapshot: {
        title: book.title,
        author: book.author,
        coverImage: book.coverImage,
        rentalPricePerDay: book.rentalPricePerDay
      },
      rentalDays: days,
      quantity: qty,
      dailyFee,
      totalFee,
      deposit,
      totalPaid,
      shippingAddress: {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state || 'Delhi',
        zipCode: shippingAddress.zipCode,
        country: shippingAddress.country || 'India'
      },
      customerName: req.user.name,
      customerPhone: req.user.phone || shippingAddress.phone || '9876543210',
      paymentMethod,
      paymentStatus: paymentMethod === 'COD' ? 'Pending' : 'Pending',
      status: 'PendingDelivery',
      returnMethod: 'PickupRequired',
      stockRestored: false,
      notes: notes || ''
    });

    // Create initial Delivery for Rental
    const deliveryNumber = `DEL-RNT-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const delivery = await Delivery.create({
      deliveryNumber,
      type: 'RentalDelivery',
      rental: rental._id,
      customer: req.user._id,
      customerName: req.user.name,
      customerPhone: rental.customerPhone,
      deliveryAddress: rental.shippingAddress,
      items: [{
        title: book.title,
        quantity: qty,
        book: book._id
      }],
      status: 'PendingAssignment',
      timeline: [{
        status: 'PendingAssignment',
        timestamp: new Date(),
        actor: { id: req.user._id, role: 'customer', name: req.user.name },
        notes: `Rental request initiated for ${days} days.`
      }]
    });

    rental.delivery = delivery._id;
    await rental.save();

    // Clear rented item from user's cart if any
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      cart.items = cart.items.filter(item => !(item.itemType === 'rent' && item.book.toString() === bookId.toString()));
      await cart.save();
    }

    // In-app Notification
    await Notification.create({
      recipient: req.user._id,
      recipientRole: 'customer',
      title: 'Rental Booking Confirmed',
      message: `Your rental #${rental.rentalNumber} for "${book.title}" (${days} days) has been placed.`,
      type: 'rental',
      link: `/my-rentals/${rental._id}`
    });

    // Send confirmation email
    sendEmail({
      to: req.user.email,
      subject: `Rental Confirmation - #${rental.rentalNumber} Book Heaven`,
      html: getRentalConfirmationTemplate(rental)
    }).catch(err => console.warn(`[RentalEmail] Failed: ${err.message}`));

    res.status(201).json({
      success: true,
      message: 'Rental booked successfully.',
      rental
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer's rentals
// @route   GET /api/rentals/my-rentals
// @access  Private (Customer)
const getMyRentals = async (req, res, next) => {
  try {
    const rentals = await Rental.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('delivery')
      .populate('returnDelivery');

    res.status(200).json({
      success: true,
      count: rentals.length,
      rentals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single rental details
// @route   GET /api/rentals/:id
// @access  Private
const getRentalById = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id)
      .populate('delivery')
      .populate('returnDelivery')
      .populate({
        path: 'delivery',
        populate: { path: 'assignedDeliveryBoy', select: 'name phone employeeId' }
      })
      .populate({
        path: 'returnDelivery',
        populate: { path: 'assignedDeliveryBoy', select: 'name phone employeeId' }
      });

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental record not found.' });
    }

    if (req.user.role === 'customer' && rental.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this rental.' });
    }

    res.status(200).json({
      success: true,
      rental
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all rentals for admin
// @route   GET /api/admin/rentals
// @access  Private (Admin)
const getAllRentalsAdmin = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) {
      query.status = status;
    }

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Rental.countDocuments(query);
    const rentals = await Rental.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email phone')
      .populate('delivery')
      .populate('returnDelivery');

    res.status(200).json({
      success: true,
      count: rentals.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      rentals
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Schedule rental return pickup (Admin or Customer request)
// @route   POST /api/admin/rentals/:id/schedule-pickup
// @access  Private (Admin or Customer owner)
const scheduleReturnPickup = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found.' });
    }

    if (rental.status === 'Returned' || rental.status === 'Cancelled') {
      return res.status(400).json({
        success: false,
        message: `Cannot schedule return pickup for a rental that is already ${rental.status}.`
      });
    }

    if (rental.returnDelivery) {
      const existingDelivery = await Delivery.findById(rental.returnDelivery);
      if (existingDelivery && !['Delivered', 'Cancelled'].includes(existingDelivery.status)) {
        return res.status(400).json({
          success: false,
          message: 'A return pickup is already scheduled for this rental.'
        });
      }
    }

    const deliveryNumber = `DEL-RET-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    const returnDelivery = await Delivery.create({
      deliveryNumber,
      type: 'RentalReturnPickup',
      rental: rental._id,
      customer: rental.user,
      customerName: rental.customerName,
      customerPhone: rental.customerPhone,
      pickupLocation: `${rental.shippingAddress.street}, ${rental.shippingAddress.city} - ${rental.shippingAddress.zipCode}`,
      deliveryAddress: {
        street: 'Book Heaven Central Warehouse',
        city: 'New Delhi',
        state: 'Delhi',
        zipCode: '110001',
        country: 'India'
      },
      items: [{
        title: rental.bookSnapshot.title,
        quantity: rental.quantity,
        book: rental.book
      }],
      status: 'PendingAssignment',
      timeline: [{
        status: 'PendingAssignment',
        timestamp: new Date(),
        actor: { id: req.user._id, role: req.user.role, name: req.user.name },
        notes: `Return pickup scheduled by ${req.user.role}.`
      }]
    });

    rental.returnDelivery = returnDelivery._id;
    rental.status = 'ReturnScheduled';
    await rental.save();

    await Notification.create({
      recipient: rental.user,
      recipientRole: 'customer',
      title: 'Return Pickup Scheduled',
      message: `Return pickup for rental #${rental.rentalNumber} has been scheduled. Delivery #${returnDelivery.deliveryNumber}`,
      type: 'rental',
      link: `/my-rentals/${rental._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Return pickup scheduled successfully.',
      rental,
      returnDelivery
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Confirm physical return of rented book and restore stock EXACTLY ONCE
// @route   PATCH /api/admin/rentals/:id/return
// @access  Private (Admin)
const confirmReturnAdmin = async (req, res, next) => {
  try {
    const rental = await Rental.findById(req.params.id);
    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental not found.' });
    }

    if (rental.status === 'Returned' || rental.stockRestored) {
      return res.status(400).json({
        success: false,
        message: 'This rental has already been marked as returned and inventory has already been restored.'
      });
    }

    // Atomically restore available stock exactly once
    const updatedBook = await Book.findByIdAndUpdate(
      rental.book,
      { $inc: { availableStock: rental.quantity } },
      { new: true }
    );

    rental.status = 'Returned';
    rental.stockRestored = true;
    rental.returnDate = new Date();
    await rental.save();

    // If return delivery exists, mark it as delivered/completed if not already
    if (rental.returnDelivery) {
      await Delivery.findByIdAndUpdate(rental.returnDelivery, {
        status: 'Delivered',
        deliveredTimestamp: new Date(),
        $push: {
          timeline: {
            status: 'Delivered',
            timestamp: new Date(),
            actor: { id: req.user._id, role: 'admin', name: req.user.name },
            notes: 'Physical return confirmed and verified at warehouse by Administrator. Stock restored.'
          }
        }
      });
    }

    await Notification.create({
      recipient: rental.user,
      recipientRole: 'customer',
      title: 'Rental Return Confirmed',
      message: `Your return for "${rental.bookSnapshot.title}" has been confirmed and closed. Thank you!`,
      type: 'rental',
      link: `/my-rentals/${rental._id}`
    });

    res.status(200).json({
      success: true,
      message: 'Physical return confirmed. Inventory restored successfully.',
      rental,
      bookAvailableStock: updatedBook ? updatedBook.availableStock : null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel a rental before it is delivered to customer
// @route   PATCH /api/rentals/:id/cancel
// @access  Private (Customer)
const cancelRentalCustomer = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const rental = await Rental.findById(req.params.id);

    if (!rental) {
      return res.status(404).json({ success: false, message: 'Rental record not found.' });
    }

    if (req.user.role === 'customer' && rental.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this rental.' });
    }

    if (['Returned', 'Cancelled'].includes(rental.status)) {
      return res.status(400).json({
        success: false,
        message: `This rental is already ${rental.status.toLowerCase()}.`
      });
    }

    // Restore available stock if not already restored
    if (!rental.stockRestored) {
      await Book.findByIdAndUpdate(rental.book, {
        $inc: { availableStock: rental.quantity }
      });
      rental.stockRestored = true;
    }

    rental.status = 'Cancelled';
    rental.notes = rental.notes ? `${rental.notes} | Cancelled by customer: ${reason || 'Customer request'}` : `Cancelled by customer: ${reason || 'Customer request'}`;
    if (rental.paymentStatus === 'Completed') {
      rental.paymentStatus = 'RefundPending';
    }
    await rental.save();

    // Cancel associated outbound delivery
    if (rental.delivery) {
      await Delivery.findByIdAndUpdate(rental.delivery, {
        status: 'Cancelled',
        $push: {
          timeline: {
            status: 'Cancelled',
            timestamp: new Date(),
            actor: { id: req.user._id, role: 'customer', name: req.user.name },
            notes: `Rental cancelled by customer. Reason: ${reason || 'Customer request'}`
          }
        }
      });
    }

    // Customer Notification
    await Notification.create({
      recipient: req.user._id,
      recipientRole: 'customer',
      title: 'Rental Booking Cancelled',
      message: `Your rental #${rental.rentalNumber} for "${rental.bookSnapshot.title}" has been cancelled. Available stock has been restored.`,
      type: 'rental',
      link: `/my-rentals/${rental._id}`
    });

    // Admin Notification
    await Notification.create({
      recipient: rental.user,
      recipientRole: 'admin',
      title: 'Rental Cancelled by Customer',
      message: `Rental #${rental.rentalNumber} for "${rental.bookSnapshot.title}" was cancelled by ${req.user.name}.`,
      type: 'rental',
      link: `/admin/rentals`
    });

    res.status(200).json({
      success: true,
      message: 'Rental booking has been successfully cancelled and stock has been restored.',
      rental
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createRental,
  getMyRentals,
  getRentalById,
  getAllRentalsAdmin,
  scheduleReturnPickup,
  confirmReturnAdmin,
  cancelRentalCustomer
};
