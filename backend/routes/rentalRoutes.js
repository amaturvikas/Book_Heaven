const express = require('express');
const router = express.Router();
const {
  createRental,
  getMyRentals,
  getRentalById,
  getAllRentalsAdmin,
  scheduleReturnPickup,
  confirmReturnAdmin,
  cancelRentalCustomer
} = require('../controllers/rentalController');
const { authenticate, authorize } = require('../middleware/auth');

router.post('/', authenticate, authorize('customer'), createRental);
router.get('/my-rentals', authenticate, authorize('customer'), getMyRentals);
router.get('/:id', authenticate, getRentalById);
router.post('/:id/request-return', authenticate, authorize('customer', 'admin'), scheduleReturnPickup);
router.patch('/:id/cancel', authenticate, authorize('customer', 'admin'), cancelRentalCustomer);

// Admin endpoints
router.get('/admin/all', authenticate, authorize('admin'), getAllRentalsAdmin);
router.post('/admin/:id/schedule-pickup', authenticate, authorize('admin'), scheduleReturnPickup);
router.patch('/admin/:id/return', authenticate, authorize('admin'), confirmReturnAdmin);

module.exports = router;
