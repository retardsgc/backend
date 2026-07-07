const express = require('express');
const {
  initiatePayment,
  processPayment,
  getPaymentStatus,
  processCOD,
  getPaymentMethods,
  createRazorpayOrder,
  verifyRazorpayPayment
} = require('../controllers/paymentController');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Public routes
router.get('/methods', getPaymentMethods);

// Guest-friendly payment routes (no auth - order verified by ID)
router.post('/cod', processCOD);
router.post('/razorpay/order', createRazorpayOrder);
router.post('/razorpay/verify', verifyRazorpayPayment);

// Protected routes (legacy - kept for admin use)
router.post('/initiate', protect, initiatePayment);
router.post('/process', protect, processPayment);
router.get('/:orderId/status', protect, getPaymentStatus);

module.exports = router;
