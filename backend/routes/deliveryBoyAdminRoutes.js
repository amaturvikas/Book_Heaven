const express = require('express');
const router = express.Router();
const {
  createDeliveryBoy,
  getDeliveryBoys,
  getDeliveryBoyById,
  updateDeliveryBoy,
  toggleDeliveryBoyStatus
} = require('../controllers/deliveryBoyAdminController');
const { authenticate, authorize } = require('../middleware/auth');

router.use(authenticate, authorize('admin'));

router.post('/', createDeliveryBoy);
router.get('/', getDeliveryBoys);
router.get('/:id', getDeliveryBoyById);
router.patch('/:id', updateDeliveryBoy);
router.patch('/:id/status', toggleDeliveryBoyStatus);

module.exports = router;
