const ROLES = {
  CUSTOMER: 'customer',
  ADMIN: 'admin',
  DELIVERY_BOY: 'deliveryBoy'
};

const DELIVERY_STATUS = {
  PENDING_ASSIGNMENT: 'PendingAssignment',
  ASSIGNED: 'Assigned',
  PICKED_UP: 'PickedUp',
  OUT_FOR_DELIVERY: 'OutForDelivery',
  DELIVERED: 'Delivered',
  FAILED: 'Failed',
  CANCELLED: 'Cancelled'
};

const DELIVERY_TYPES = {
  PURCHASE: 'Purchase',
  RENTAL_DELIVERY: 'RentalDelivery',
  RENTAL_RETURN_PICKUP: 'RentalReturnPickup'
};

const ORDER_STATUS = {
  PLACED: 'Placed',
  PROCESSING: 'Processing',
  DISPATCHED: 'Dispatched',
  DELIVERED: 'Delivered',
  CANCELLED: 'Cancelled'
};

const RENTAL_STATUS = {
  PENDING_DELIVERY: 'PendingDelivery',
  ACTIVE: 'Active',
  DUE: 'Due',
  OVERDUE: 'Overdue',
  RETURN_SCHEDULED: 'ReturnScheduled',
  RETURN_COLLECTED: 'ReturnCollected',
  RETURNED: 'Returned',
  CANCELLED: 'Cancelled'
};

const PAYMENT_METHODS = {
  COD: 'COD',
  RAZORPAY: 'Razorpay'
};

const PAYMENT_STATUS = {
  PENDING: 'Pending',
  COMPLETED: 'Completed',
  FAILED: 'Failed'
};

const CATEGORIES = [
  'Fiction',
  'Romance',
  'Mystery',
  'Fantasy',
  'Science Fiction',
  'History',
  'Biography',
  'Business',
  'Technology',
  'Education',
  'Children',
  'Comics',
  'Self-Help'
];

module.exports = {
  ROLES,
  DELIVERY_STATUS,
  DELIVERY_TYPES,
  ORDER_STATUS,
  RENTAL_STATUS,
  PAYMENT_METHODS,
  PAYMENT_STATUS,
  CATEGORIES
};
