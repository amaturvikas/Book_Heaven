const Order = require('../models/Order');
const Book = require('../models/Book');
const Delivery = require('../models/Delivery');
const Notification = require('../models/Notification');
const Cart = require('../models/Cart');
const { sendEmail } = require('../utils/emailService');
const { getOrderConfirmationTemplate } = require('../utils/emailTemplates');

// @desc    Create a new purchase order with atomic inventory deduction
// @route   POST /api/orders
// @access  Private (Customer)
const createOrder = async (req, res, next) => {
  const decrementedBooks = [];
  try {
    const { items, shippingAddress, paymentMethod = 'COD', notes } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, message: 'Your order must include at least one book.' });
    }

    if (!shippingAddress || !shippingAddress.street || !shippingAddress.city || !shippingAddress.zipCode) {
      return res.status(400).json({ success: false, message: 'Please provide a valid delivery address.' });
    }

    const orderItems = [];
    let totalAmount = 0;

    // Atomic stock verification and deduction
    for (const item of items) {
      const bookId = item.bookId || item.book;
      const quantity = Math.max(1, parseInt(item.quantity, 10) || 1);

      // Atomic conditional update
      const updatedBook = await Book.findOneAndUpdate(
        { _id: bookId, availableStock: { $gte: quantity } },
        { $inc: { availableStock: -quantity } },
        { new: true }
      );

      if (!updatedBook) {
        // Rollback already decremented books
        for (const dec of decrementedBooks) {
          await Book.findByIdAndUpdate(dec.bookId, { $inc: { availableStock: dec.quantity } });
        }
        const requestedBook = await Book.findById(bookId);
        const bookTitle = requestedBook ? requestedBook.title : 'Selected book';
        const inStock = requestedBook ? requestedBook.availableStock : 0;
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for "${bookTitle}". Available: ${inStock}, requested: ${quantity}.`
        });
      }

      decrementedBooks.push({ bookId, quantity });

      const itemTotal = updatedBook.purchasePrice * quantity;
      totalAmount += itemTotal;

      orderItems.push({
        book: updatedBook._id,
        title: updatedBook.title,
        author: updatedBook.author,
        coverImage: updatedBook.coverImage,
        price: updatedBook.purchasePrice,
        quantity,
        total: itemTotal
      });
    }

    const orderNumber = `ORD-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;

    // Create Order
    const order = await Order.create({
      orderNumber,
      user: req.user._id,
      items: orderItems,
      totalAmount,
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
      orderStatus: 'Placed',
      notes: notes || ''
    });

    // Create corresponding Delivery record
    const deliveryNumber = `DEL-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`;
    const delivery = await Delivery.create({
      deliveryNumber,
      type: 'Purchase',
      order: order._id,
      customer: req.user._id,
      customerName: req.user.name,
      customerPhone: order.customerPhone,
      deliveryAddress: order.shippingAddress,
      items: orderItems.map(i => ({ title: i.title, quantity: i.quantity, book: i.book })),
      status: 'PendingAssignment',
      timeline: [{
        status: 'PendingAssignment',
        timestamp: new Date(),
        actor: { id: req.user._id, role: 'customer', name: req.user.name },
        notes: 'Order placed by customer. Awaiting assignment.'
      }]
    });

    order.delivery = delivery._id;
    await order.save();

    // Clear ordered purchase items from user's cart if any
    const cart = await Cart.findOne({ user: req.user._id });
    if (cart) {
      const orderedBookIds = orderItems.map(i => i.book.toString());
      cart.items = cart.items.filter(item => !(item.itemType === 'buy' && orderedBookIds.includes(item.book.toString())));
      await cart.save();
    }

    // In-app Notifications
    await Notification.create({
      recipient: req.user._id,
      recipientRole: 'customer',
      title: 'Order Placed Successfully',
      message: `Your order #${order.orderNumber} for ₹${order.totalAmount.toFixed(2)} has been placed.`,
      type: 'order',
      link: `/my-orders/${order._id}`
    });

    // Send confirmation email asynchronously
    sendEmail({
      to: req.user.email,
      subject: `Order Confirmation - #${order.orderNumber} Book Heaven`,
      html: getOrderConfirmationTemplate(order)
    }).catch(err => console.warn(`[OrderEmail] Failed: ${err.message}`));

    res.status(201).json({
      success: true,
      message: 'Order placed successfully.',
      order
    });
  } catch (error) {
    // Rollback any reserved stock on unhandled error
    for (const dec of decrementedBooks) {
      await Book.findByIdAndUpdate(dec.bookId, { $inc: { availableStock: dec.quantity } }).catch(() => {});
    }
    next(error);
  }
};

// @desc    Get customer's orders
// @route   GET /api/orders/my-orders
// @access  Private (Customer)
const getMyOrders = async (req, res, next) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .sort({ createdAt: -1 })
      .populate('delivery');

    res.status(200).json({
      success: true,
      count: orders.length,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order details
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('delivery')
      .populate({
        path: 'delivery',
        populate: {
          path: 'assignedDeliveryBoy',
          select: 'name phone employeeId vehicleDetails'
        }
      });

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    // Check ownership: Admin can view all, customer only their own
    if (req.user.role === 'customer' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to view this order.' });
    }

    res.status(200).json({
      success: true,
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/admin/orders
// @access  Private (Admin)
const getAllOrdersAdmin = async (req, res, next) => {
  try {
    const { status, paymentStatus, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.orderStatus = status;
    if (paymentStatus) query.paymentStatus = paymentStatus;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Order.countDocuments(query);
    const orders = await Order.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('user', 'name email phone')
      .populate('delivery');

    res.status(200).json({
      success: true,
      count: orders.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/admin/orders/:id/status
// @access  Private (Admin)
const updateOrderStatusAdmin = async (req, res, next) => {
  try {
    const { orderStatus, paymentStatus, notes } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (orderStatus) {
      if (orderStatus === 'Cancelled' && order.orderStatus !== 'Cancelled') {
        for (const item of order.items) {
          await Book.findByIdAndUpdate(item.book, {
            $inc: { availableStock: item.quantity }
          });
        }
        if (order.delivery) {
          await Delivery.findByIdAndUpdate(order.delivery, { status: 'Cancelled' });
        }
        order.cancellationReason = notes || 'Cancelled by Administrator';
      }
      order.orderStatus = orderStatus;
    }
    if (paymentStatus) order.paymentStatus = paymentStatus;
    if (notes) order.notes = notes;

    await order.save();

    res.status(200).json({
      success: true,
      message: 'Order status updated successfully.',
      order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel an order by customer and restore inventory
// @route   PATCH /api/orders/:id/cancel
// @access  Private (Customer)
const cancelOrderCustomer = async (req, res, next) => {
  try {
    const { reason } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found.' });
    }

    if (req.user.role === 'customer' && order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'You are not authorized to cancel this order.' });
    }

    if (['Delivered', 'Cancelled'].includes(order.orderStatus)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an order that is already ${order.orderStatus.toLowerCase()}.`
      });
    }

    // Atomically restore available stock for all items
    for (const item of order.items) {
      await Book.findByIdAndUpdate(item.book, {
        $inc: { availableStock: item.quantity }
      });
    }

    order.orderStatus = 'Cancelled';
    order.cancellationReason = reason || 'Cancelled by customer';
    if (order.paymentStatus === 'Completed') {
      order.paymentStatus = 'RefundPending';
    }
    await order.save();

    // Cancel associated delivery task if pending or assigned
    if (order.delivery) {
      await Delivery.findByIdAndUpdate(order.delivery, {
        status: 'Cancelled',
        $push: {
          timeline: {
            status: 'Cancelled',
            timestamp: new Date(),
            actor: { id: req.user._id, role: 'customer', name: req.user.name },
            notes: `Order cancelled by customer. Reason: ${reason || 'Customer request'}`
          }
        }
      });
    }

    // Customer Notification
    await Notification.create({
      recipient: req.user._id,
      recipientRole: 'customer',
      title: 'Order Cancelled',
      message: `Your order #${order.orderNumber} has been successfully cancelled and stock has been restored.`,
      type: 'order',
      link: `/my-orders/${order._id}`
    });

    // Admin Notification
    await Notification.create({
      recipient: order.user,
      recipientRole: 'admin',
      title: 'Order Cancelled by Customer',
      message: `Order #${order.orderNumber} was cancelled by ${req.user.name}. Reason: ${reason || 'Not specified'}.`,
      type: 'order',
      link: `/admin/orders`
    });

    res.status(200).json({
      success: true,
      message: 'Order has been successfully cancelled and inventory has been restored.',
      order
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  cancelOrderCustomer
};
