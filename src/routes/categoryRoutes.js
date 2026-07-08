const express = require('express');
const { protectAdmin } = require('../middleware/adminAuth'); // FIX-BE-ROUTES: C-3
const {
  getCategories,
  getCategoryById,
  getCategoryProducts,
  getCategoryStats,
  createCategory,
  updateCategory,
  deleteCategory,
  toggleCategoryStatus,
  bulkUpdateStatus,
  migrateCategories,
  fixCategoryIds
} = require('../controllers/categoryController');

const router = express.Router();

// @route   GET /api/categories
// @desc    Get all categories with filtering and pagination
// @access  Public
router.get('/', getCategories);

// @route   GET /api/categories/stats/overview
// @desc    Get category statistics
// @access  Public
router.get('/stats/overview', getCategoryStats);

// @route   POST /api/categories/migrate
// @desc    Migrate existing product categories to new category system
// @access  Private
router.post('/migrate', protectAdmin, migrateCategories); // FIX-BE-ROUTES: C-3

// @route   POST /api/categories/fix-ids
// @desc    Fix categories that don't have proper ObjectIds
// @access  Private
router.post('/fix-ids', protectAdmin, fixCategoryIds); // FIX-BE-ROUTES: C-3

// @route   PATCH /api/categories/bulk-status
// @desc    Bulk update category status
// @access  Private
router.patch('/bulk-status', protectAdmin, bulkUpdateStatus); // FIX-BE-ROUTES: C-3

// @route   GET /api/categories/:id
// @desc    Get category by ID
// @access  Public
router.get('/:id', getCategoryById);

// @route   GET /api/categories/:id/products
// @desc    Get products by category
// @access  Public
router.get('/:id/products', getCategoryProducts);

// @route   POST /api/categories
// @desc    Create new category
// @access  Private
router.post('/', protectAdmin, createCategory); // FIX-BE-ROUTES: C-3

// @route   PUT /api/categories/:id
// @desc    Update category
// @access  Private
router.put('/:id', protectAdmin, updateCategory); // FIX-BE-ROUTES: C-3

// @route   DELETE /api/categories/:id
// @desc    Delete category
// @access  Private
router.delete('/:id', protectAdmin, deleteCategory); // FIX-BE-ROUTES: C-3

// @route   PATCH /api/categories/:id/toggle-status
// @desc    Toggle category status (enable/disable)
// @access  Private
router.patch('/:id/toggle-status', protectAdmin, toggleCategoryStatus); // FIX-BE-ROUTES: C-3

module.exports = router;
