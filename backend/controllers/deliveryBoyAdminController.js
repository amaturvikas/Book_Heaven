const DeliveryBoy = require('../models/DeliveryBoy');
const Delivery = require('../models/Delivery');

// @desc    Create a new delivery boy account
// @route   POST /api/admin/delivery-boys
// @access  Private (Admin)
const createDeliveryBoy = async (req, res, next) => {
  try {
    const { name, email, phone, employeeId, password, address, vehicleDetails } = req.body;

    if (!name || !email || !phone || !employeeId || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, phone, employee ID, and initial password.'
      });
    }

    const existingEmail = await DeliveryBoy.findOne({ email: email.toLowerCase() });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'A delivery boy with this email already exists.' });
    }

    const existingEmpId = await DeliveryBoy.findOne({ employeeId: employeeId.toUpperCase() });
    if (existingEmpId) {
      return res.status(400).json({ success: false, message: 'A delivery boy with this employee ID already exists.' });
    }

    const deliveryBoy = await DeliveryBoy.create({
      name,
      email: email.toLowerCase(),
      phone,
      employeeId: employeeId.toUpperCase(),
      password,
      address: address || '',
      vehicleDetails: vehicleDetails || { vehicleType: 'Bike', vehicleNumber: '' },
      status: 'Active'
    });

    res.status(201).json({
      success: true,
      message: 'Delivery boy account created successfully.',
      deliveryBoy: {
        id: deliveryBoy._id,
        name: deliveryBoy.name,
        email: deliveryBoy.email,
        phone: deliveryBoy.phone,
        employeeId: deliveryBoy.employeeId,
        vehicleDetails: deliveryBoy.vehicleDetails,
        status: deliveryBoy.status
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all delivery boys
// @route   GET /api/admin/delivery-boys
// @access  Private (Admin)
const getDeliveryBoys = async (req, res, next) => {
  try {
    const deliveryBoys = await DeliveryBoy.find().select('-password').sort({ createdAt: -1 });

    // Attach active assigned task counts to each delivery boy
    const deliveryBoysWithStats = await Promise.all(
      deliveryBoys.map(async (db) => {
        const activeTasks = await Delivery.countDocuments({
          assignedDeliveryBoy: db._id,
          status: { $in: ['Assigned', 'PickedUp', 'OutForDelivery'] }
        });
        const completedTasks = await Delivery.countDocuments({
          assignedDeliveryBoy: db._id,
          status: 'Delivered'
        });
        return {
          ...db.toObject(),
          activeTasks,
          completedTasks
        };
      })
    );

    res.status(200).json({
      success: true,
      count: deliveryBoysWithStats.length,
      deliveryBoys: deliveryBoysWithStats
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single delivery boy by ID
// @route   GET /api/admin/delivery-boys/:id
// @access  Private (Admin)
const getDeliveryBoyById = async (req, res, next) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.params.id).select('-password');
    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: 'Delivery boy not found.' });
    }

    const activeTasks = await Delivery.find({
      assignedDeliveryBoy: deliveryBoy._id,
      status: { $in: ['Assigned', 'PickedUp', 'OutForDelivery'] }
    });

    res.status(200).json({
      success: true,
      deliveryBoy,
      activeTasks
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update delivery boy details
// @route   PATCH /api/admin/delivery-boys/:id
// @access  Private (Admin)
const updateDeliveryBoy = async (req, res, next) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);
    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: 'Delivery boy not found.' });
    }

    const { name, phone, address, vehicleDetails, status } = req.body;
    if (name) deliveryBoy.name = name;
    if (phone) deliveryBoy.phone = phone;
    if (address !== undefined) deliveryBoy.address = address;
    if (vehicleDetails) deliveryBoy.vehicleDetails = vehicleDetails;
    if (status && ['Active', 'Inactive'].includes(status)) deliveryBoy.status = status;

    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: 'Delivery boy updated successfully.',
      deliveryBoy
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Toggle Delivery Boy Active/Inactive status
// @route   PATCH /api/admin/delivery-boys/:id/status
// @access  Private (Admin)
const toggleDeliveryBoyStatus = async (req, res, next) => {
  try {
    const deliveryBoy = await DeliveryBoy.findById(req.params.id);
    if (!deliveryBoy) {
      return res.status(404).json({ success: false, message: 'Delivery boy not found.' });
    }

    const { status } = req.body;
    const newStatus = status || (deliveryBoy.status === 'Active' ? 'Inactive' : 'Active');

    deliveryBoy.status = newStatus;
    await deliveryBoy.save();

    res.status(200).json({
      success: true,
      message: `Delivery boy status updated to ${newStatus}.`,
      deliveryBoy
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createDeliveryBoy,
  getDeliveryBoys,
  getDeliveryBoyById,
  updateDeliveryBoy,
  toggleDeliveryBoyStatus
};
