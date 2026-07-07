const express = require('express');
const router = express.Router();
const { getAllImages, uploadImages, deleteImage, upload } = require('../controllers/imageController');
const { protectAdmin } = require('../middleware/adminAuth');

// Route: GET /api/images
// @desc    Get list of all available images
// @access  Private/Admin
router.get('/', protectAdmin, getAllImages);

// Route: POST /api/images/upload
// @desc    Upload images to the images directory
// @access  Private/Admin
router.post('/upload', protectAdmin, upload.array('images', 10), uploadImages);

// Route: DELETE /api/images/:filename
// @desc    Delete an image from the images directory
// @access  Private/Admin
// Using wildcard (*) to capture paths with subdirectories like "subdir/filename.png"
router.delete('/*', protectAdmin, deleteImage);

module.exports = router;
