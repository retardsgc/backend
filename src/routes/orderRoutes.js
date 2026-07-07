const express = require('express');
const { protect } = require('../middleware/auth');
const {
  createDirectOrder,
  createOrderFromCart,
  getMyOrders,
  getOrderById,
  cancelMyOrder,
  getOrderTracking,
  reorderFromOrder,
  getMyOrderStats,
  requestReturn,
  createGuestOrder,
  getGuestOrder
} = require('../controllers/orderController');

const router = express.Router();

// Guest routes (no auth required)
router.post('/guest', createGuestOrder);
router.get('/guest', (req, res) => res.status(405).json({ success: false, message: 'Use POST /api/orders/guest to place a guest order.' }));
router.get('/guest/:id', getGuestOrder);

router.use(protect);

// Create order directly from product selection
router.post('/direct', createDirectOrder);

// Create order from the current cart
router.post('/', createOrderFromCart);

// Get my orders
router.get('/', getMyOrders);

// Get order statistics
router.get('/stats/overview', getMyOrderStats);

// Get order tracking information
router.get('/:id/tracking', getOrderTracking);

// Request return for an order
router.post('/:id/return', requestReturn);

// Create reorder from existing order
router.post('/:id/reorder', reorderFromOrder);

// Get specific order by id
router.get('/:id', getOrderById);

// Cancel my order (if pending)
router.patch('/:id/cancel', cancelMyOrder);

module.exports = router;







