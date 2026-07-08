const express = require('express');
const router = express.Router();
const {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getHotDealProducts,
  getBestsellerProducts,
  searchProducts,
  getProductStats,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateProductStatus
} = require('../controllers/productController');
const { protectAdmin } = require('../middleware/adminAuth'); // FIX-BE-ROUTES: C-3

// Route: GET /api/products/hotdeals
// Must be defined before /api/products/:id to avoid conflicts
router.get('/hotdeals', getHotDealProducts);

// Route: GET /api/products/bestsellers
router.get('/bestsellers', getBestsellerProducts);

// Route: GET /api/products/featured
router.get('/featured', getHotDealProducts);

// Route: GET /api/products/search
router.get('/search', searchProducts);

// Route: GET /api/products/stats
router.get('/stats', getProductStats);

// Route: GET /api/products/category/:categoryId
router.get('/category/:categoryId', getProductsByCategory);

// Route: GET /api/products/:id/related
router.get('/:id/related', getRelatedProducts);

// Route: GET /api/products
router.get('/', getAllProducts);

// Route: GET /api/products/:id
router.get('/:id', getProductById);

// FIX-BE-ROUTES: C-3 added protectAdmin for write routes
router.use(protectAdmin);

// Route: PATCH /api/products/:id/status
router.patch('/:id/status', updateProductStatus);

// Route: PUT /api/products/:id
router.put('/:id', updateProduct);

// Route: DELETE /api/products/:id
router.delete('/:id', deleteProduct);

// Route: POST /api/products
router.post('/', createProduct);

module.exports = router;
