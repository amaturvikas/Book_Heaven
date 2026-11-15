const express = require('express');
const router = express.Router();
const {
  getAllDeliveriesAdmin,
  getDeliveryById,
  assignDelivery,
  reassignDelivery,
  getAssignedDeliveriesForDeliveryBoy,
  updateDeliveryStatusByDeliveryBoy,
  getDeliveryHistoryDeliveryBoy,
  getReturnPickupsDeliveryBoy
} = require('../controllers/deliveryController');
const { authenticate, authorize } = require('../middleware/auth');

// Shared delivery lookup (validates ownership inside controller)
router.get('/:id', authenticate, getDeliveryById);

// Admin delivery management
router.get('/admin/all', authenticate, authorize('admin'), getAllDeliveriesAdmin);
router.post('/admin/:id/assign', authenticate, authorize('admin'), assignDelivery);
router.patch('/admin/:id/reassign', authenticate, authorize('admin'), reassignDelivery);

// Delivery boy delivery management
router.get('/delivery-boy/active', authenticate, authorize('deliveryBoy'), getAssignedDeliveriesForDeliveryBoy);
router.get('/delivery-boy/history', authenticate, authorize('deliveryBoy'), getDeliveryHistoryDeliveryBoy);
router.get('/delivery-boy/return-pickups', authenticate, authorize('deliveryBoy'), getReturnPickupsDeliveryBoy);
router.get('/delivery-boy/:id', authenticate, authorize('deliveryBoy'), getDeliveryById);
router.patch('/delivery-boy/:id/status', authenticate, authorize('deliveryBoy'), updateDeliveryStatusByDeliveryBoy);

module.exports = router;
