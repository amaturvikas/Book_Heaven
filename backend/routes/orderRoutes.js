const express = require('express');
const router = express.Router();
const {
  createOrder,
  getMyOrders,
  getOrderById,
  getAllOrdersAdmin,
  updateOrderStatusAdmin,
  cancelOrderCustomer
} = require('../controllers/orderController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('customer'), createOrder);
router.get('/my-orders', authenticate, authorize('customer'), getMyOrders);
router.get('/:id', authenticate, getOrderById);
router.patch('/:id/cancel', authenticate, authorize('customer', 'admin'), cancelOrderCustomer);

// Admin endpoints
router.get('/admin/all', authenticate, authorize('admin'), getAllOrdersAdmin);
router.patch('/admin/:id/status', authenticate, authorize('admin'), updateOrderStatusAdmin);

module.exports = router;
