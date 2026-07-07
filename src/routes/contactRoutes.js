const express = require('express');
const router = express.Router();
const {
  submitInquiry,
  getAllInquiries,
  getInquiry,
  updateInquiry,
  deleteInquiry,
  markAsRead
} = require('../controllers/contactController');
const { protectAdmin } = require('../middleware/adminAuth');

// Public route - submit contact form
router.post('/', submitInquiry);

// Admin routes - protected with admin authentication
router.get('/', protectAdmin, getAllInquiries);
router.get('/:id', protectAdmin, getInquiry);
router.patch('/:id', protectAdmin, updateInquiry);
router.patch('/:id/read', protectAdmin, markAsRead);
router.delete('/:id', protectAdmin, deleteInquiry);

module.exports = router;
