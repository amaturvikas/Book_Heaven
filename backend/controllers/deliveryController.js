const Delivery = require('../models/Delivery');
const DeliveryBoy = require('../models/DeliveryBoy');
const Order = require('../models/Order');
const Rental = require('../models/Rental');
const Notification = require('../models/Notification');
const { sendEmail } = require('../utils/emailService');
const { getDeliveryStatusTemplate } = require('../utils/emailTemplates');

// Valid state machine transitions
const VALID_TRANSITIONS = {
  'PendingAssignment': ['Assigned', 'Cancelled'],
  'Assigned': ['PickedUp', 'Cancelled'],
  'PickedUp': ['OutForDelivery', 'Cancelled'],
  'OutForDelivery': ['Delivered', 'Failed'],
  'Failed': ['Assigned', 'Cancelled'], // Admin can reassign
  'Delivered': [],
  'Cancelled': []
};

// ======================== ADMIN ENDPOINTS ========================

// @desc    Get all deliveries with filters
// @route   GET /api/admin/deliveries
// @access  Private (Admin)
const getAllDeliveriesAdmin = async (req, res, next) => {
  try {
    const { status, type, deliveryBoyId, page = 1, limit = 20 } = req.query;
    const query = {};

    if (status) query.status = status;
    if (type) query.type = type;
    if (deliveryBoyId) query.assignedDeliveryBoy = deliveryBoyId;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const skip = (pageNum - 1) * limitNum;

    const total = await Delivery.countDocuments(query);
    const deliveries = await Delivery.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .populate('assignedDeliveryBoy', 'name phone employeeId vehicleDetails status')
      .populate('customer', 'name email phone');

    res.status(200).json({
      success: true,
      count: deliveries.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      deliveries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single delivery details
// @route   GET /api/admin/deliveries/:id
// @access  Private
const getDeliveryById = async (req, res, next) => {
  try {
    const delivery = await Delivery.findById(req.params.id)
      .populate('assignedDeliveryBoy', 'name phone employeeId vehicleDetails status')
      .populate('customer', 'name email phone')
      .populate('order')
      .populate('rental');

    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found.' });
    }

    // Role-based access validation
    if (req.user.role === 'customer') {
      if (delivery.customer._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied.' });
      }
    } else if (req.user.role === 'deliveryBoy') {
      if (!delivery.assignedDeliveryBoy || delivery.assignedDeliveryBoy._id.toString() !== req.user._id.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied: This task is not assigned to you.' });
      }
    }

    res.status(200).json({
      success: true,
      delivery
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Assign delivery to an active delivery boy
// @route   POST /api/admin/deliveries/:id/assign
// @access  Private (Admin)
const assignDelivery = async (req, res, next) => {
  try {
    const { deliveryBoyId, notes } = req.body;

    if (!deliveryBoyId) {
      return res.status(400).json({ success: false, message: 'Please specify a delivery boy ID.' });
    }

    const deliveryBoy = await DeliveryBoy.findById(deliveryBoyId);
    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: 'Delivery personnel not found.' });
    }

    if (deliveryBoy.status !== 'Active') {
      return res.status(400).json({
        success: false,
        message: 'Cannot assign delivery to an inactive delivery boy.'
      });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery record not found.' });
    }

    if (delivery.status === 'Delivered') {
      return res.status(400).json({ success: false, message: 'Cannot assign an already delivered package.' });
    }

    delivery.assignedDeliveryBoy = deliveryBoy._id;
    delivery.status = 'Assigned';
    delivery.assignmentTimestamp = new Date();
    delivery.timeline.push({
      status: 'Assigned',
      timestamp: new Date(),
      actor: { id: req.user._id, role: 'admin', name: req.user.name },
      notes: notes || `Assigned to ${deliveryBoy.name} (${deliveryBoy.employeeId}).`
    });

    await delivery.save();

    // If purchase, update Order status to Processing
    if (delivery.order) {
      await Order.findByIdAndUpdate(delivery.order, { orderStatus: 'Processing' });
    }

    // In-app Notification for Delivery Boy
    await Notification.create({
      recipient: deliveryBoy._id,
      recipientRole: 'deliveryBoy',
      title: 'New Delivery Assigned',
      message: `You have been assigned delivery #${delivery.deliveryNumber} (${delivery.type}).`,
      type: 'delivery',
      link: `/delivery-boy/deliveries/${delivery._id}`
    });

    // In-app Notification for Customer
    await Notification.create({
      recipient: delivery.customer,
      recipientRole: 'customer',
      title: 'Delivery Boy Assigned',
      message: `Delivery agent ${deliveryBoy.name} (${deliveryBoy.phone}) has been assigned for #${delivery.deliveryNumber}.`,
      type: 'delivery',
      link: `/my-orders`
    });

    res.status(200).json({
      success: true,
      message: `Delivery successfully assigned to ${deliveryBoy.name}.`,
      delivery
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reassign delivery
// @route   PATCH /api/admin/deliveries/:id/reassign
// @access  Private (Admin)
const reassignDelivery = async (req, res, next) => {
  return assignDelivery(req, res, next);
};

// ======================== DELIVERY BOY ENDPOINTS ========================

// @desc    Get active deliveries assigned to logged in delivery boy
// @route   GET /api/delivery-boy/deliveries
// @access  Private (DeliveryBoy)
const getAssignedDeliveriesForDeliveryBoy = async (req, res, next) => {
  try {
    const deliveries = await Delivery.find({
      assignedDeliveryBoy: req.user._id,
      status: { $in: ['Assigned', 'PickedUp', 'OutForDelivery'] }
    })
      .sort({ updatedAt: -1 })
      .populate('rental')
      .populate('order');

    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery status by delivery boy
// @route   PATCH /api/delivery-boy/deliveries/:id/status
// @access  Private (DeliveryBoy)
const updateDeliveryStatusByDeliveryBoy = async (req, res, next) => {
  try {
    const { status, notes, failureReason, proofOfDelivery } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Please provide a target status.' });
    }

    const delivery = await Delivery.findById(req.params.id);
    if (!delivery) {
      return res.status(404).json({ success: false, message: 'Delivery task not found.' });
    }

    // Ownership check: Delivery boy can ONLY update deliveries assigned to their account
    if (!delivery.assignedDeliveryBoy || delivery.assignedDeliveryBoy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: You are not assigned to this delivery task.'
      });
    }

    // State machine transition validation
    const allowedNextStatuses = VALID_TRANSITIONS[delivery.status] || [];
    if (!allowedNextStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Invalid status transition from '${delivery.status}' to '${status}'. Allowed transitions: ${allowedNextStatuses.join(', ') || 'None'}.`
      });
    }

    // If marking as Failed, failure reason is mandatory
    if (status === 'Failed' && (!failureReason || !failureReason.trim())) {
      return res.status(400).json({
        success: false,
        message: 'A specific reason is required when marking a delivery as Failed.'
      });
    }

    const previousStatus = delivery.status;
    delivery.status = status;

    if (status === 'PickedUp') {
      delivery.pickedUpTimestamp = new Date();
      if (delivery.order) {
        await Order.findByIdAndUpdate(delivery.order, { orderStatus: 'Dispatched' });
      }
    } else if (status === 'OutForDelivery') {
      delivery.outForDeliveryTimestamp = new Date();
      if (delivery.order) {
        await Order.findByIdAndUpdate(delivery.order, { orderStatus: 'Dispatched' });
      }
    } else if (status === 'Delivered') {
      delivery.deliveredTimestamp = new Date();
      if (proofOfDelivery) {
        delivery.proofOfDelivery = {
          recipientName: proofOfDelivery.recipientName || delivery.customerName,
          notes: proofOfDelivery.notes || 'Package handed to recipient.',
          timestamp: new Date()
        };
      }

      // Update Order or Rental depending on type
      if (delivery.type === 'Purchase' && delivery.order) {
        await Order.findByIdAndUpdate(delivery.order, {
          orderStatus: 'Delivered',
          paymentStatus: 'Completed' // If COD, marked collected upon delivery
        });
      } else if (delivery.type === 'RentalDelivery' && delivery.rental) {
        const rental = await Rental.findById(delivery.rental);
        if (rental) {
          const startDate = new Date();
          const dueDate = new Date();
          dueDate.setDate(dueDate.getDate() + rental.rentalDays);

          rental.status = 'Active';
          rental.startDate = startDate;
          rental.dueDate = dueDate;
          rental.paymentStatus = 'Completed';
          await rental.save();
        }
      } else if (delivery.type === 'RentalReturnPickup' && delivery.rental) {
        // IMPORTANT: A delivery boy reporting collected does NOT increase stock directly.
        // It updates status to ReturnCollected. Admin must confirm physical return!
        await Rental.findByIdAndUpdate(delivery.rental, { status: 'ReturnCollected' });
      }
    } else if (status === 'Failed') {
      delivery.failedTimestamp = new Date();
      delivery.failureReason = failureReason;
    }

    if (notes) {
      delivery.deliveryNotes = notes;
    }

    delivery.timeline.push({
      status,
      timestamp: new Date(),
      actor: { id: req.user._id, role: 'deliveryBoy', name: req.user.name },
      notes: notes || `Status updated from ${previousStatus} to ${status}.`,
      failureReason: failureReason || ''
    });

    await delivery.save();

    // Customer Notification
    await Notification.create({
      recipient: delivery.customer,
      recipientRole: 'customer',
      title: `Delivery ${status}`,
      message: `Your package #${delivery.deliveryNumber} is now ${status}.${failureReason ? ` Reason: ${failureReason}` : ''}`,
      type: 'delivery',
      link: `/my-orders`
    });

    // Admin Notification if Failed
    if (status === 'Failed') {
      await Notification.create({
        recipient: delivery.customer, // broadcast
        recipientRole: 'admin',
        title: 'Delivery Failed',
        message: `Delivery #${delivery.deliveryNumber} failed by ${req.user.name}. Reason: ${failureReason}`,
        type: 'delivery',
        link: `/admin/deliveries/${delivery._id}`
      });
    }

    res.status(200).json({
      success: true,
      message: `Delivery status updated to ${status}.`,
      delivery
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get delivery history for delivery boy
// @route   GET /api/delivery-boy/history
// @access  Private (DeliveryBoy)
const getDeliveryHistoryDeliveryBoy = async (req, res, next) => {
  try {
    const deliveries = await Delivery.find({
      assignedDeliveryBoy: req.user._id,
      status: { $in: ['Delivered', 'Failed', 'Cancelled'] }
    }).sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      count: deliveries.length,
      deliveries
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assigned rental return pickups for delivery boy
// @route   GET /api/delivery-boy/return-pickups
// @access  Private (DeliveryBoy)
const getReturnPickupsDeliveryBoy = async (req, res, next) => {
  try {
    const returnPickups = await Delivery.find({
      assignedDeliveryBoy: req.user._id,
      type: 'RentalReturnPickup'
    })
      .sort({ createdAt: -1 })
      .populate('rental')
      .populate('customer', 'name email phone');

    res.status(200).json({
      success: true,
      count: returnPickups.length,
      returnPickups
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDeliveriesAdmin,
  getDeliveryById,
  assignDelivery,
  reassignDelivery,
  getAssignedDeliveriesForDeliveryBoy,
  updateDeliveryStatusByDeliveryBoy,
  getDeliveryHistoryDeliveryBoy,
  getReturnPickupsDeliveryBoy
};
