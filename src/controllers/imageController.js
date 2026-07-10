const fs = require('fs').promises;
const path = require('path');
const multer = require('multer');
const Image = require('../models/Image');

// @desc    Get all available images from the images directory
// @route   GET /api/images
// @access  Public (for admin interface)
const getAllImages = async (req, res) => {
  try {
    // Read from MongoDB Atlas
    const dbImages = await Image.find({}, 'name size contentType updatedAt');
    
    const images = dbImages.map(img => ({
      name: img.name,
      path: `/images/${img.name}`,
      size: img.size,
      modified: img.updatedAt,
      extension: path.extname(img.name).toLowerCase()
    }));
    
    // Sort images by name
    images.sort((a, b) => a.name.localeCompare(b.name));
    
    res.json({
      success: true,
      count: images.length,
      data: images
    });
  } catch (error) {
    console.error('Error reading images from database:', error);
    res.status(500).json({
      success: false,
      message: 'Error reading images from database',
      error: error.message
    });
  }
};

// Configure multer for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const imagesPath = path.join(__dirname, '..', '..', '..', 'images');
    cb(null, imagesPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename to avoid conflicts
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    cb(null, `${name}-${uniqueSuffix}${ext}`);
  }
});

// File filter to only allow image files
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, GIF, WebP, and SVG files are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
    files: 10 // Maximum 10 files at once
  }
});

// @desc    Upload images to the images directory
// @route   POST /api/images/upload
// @access  Public (for admin interface)
const uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No files uploaded'
      });
    }

    const uploadedFiles = [];
    for (const file of req.files) {
      // Read the file buffer
      const fileData = await fs.readFile(file.path);
      
      // Save/Upsert to MongoDB Atlas
      await Image.findOneAndUpdate(
        { name: file.filename },
        {
          name: file.filename,
          data: fileData,
          contentType: file.mimetype,
          size: file.size
        },
        { upsert: true, new: true }
      );

      // FIX-BE-IMAGES: M-9 Keep disk copy for express.static fallback (don't unlink)
      uploadedFiles.push({
        name: file.filename,
        originalName: file.originalname,
        path: `/images/${file.filename}`,
        size: file.size,
        mimetype: file.mimetype
      });
    }

    res.json({
      success: true,
      message: `Successfully uploaded ${uploadedFiles.length} file(s) to Atlas`,
      data: uploadedFiles,
      count: uploadedFiles.length
    });
  } catch (error) {
    console.error('Error uploading images:', error);
    res.status(500).json({
      success: false,
      message: 'Error uploading images',
      error: error.message
    });
  }
};

// @desc    Delete an image from the images directory
// @route   DELETE /api/images/*
// @access  Public (for admin interface)
const deleteImage = async (req, res) => {
  try {
    const filename = req.params[0] || req.params.filename;
    if (!filename) {
      return res.status(400).json({
        success: false,
        message: 'Filename is required'
      });
    }
    
    const decodedFilename = decodeURIComponent(filename);
    
    // Delete from MongoDB Atlas
    const result = await Image.deleteOne({ name: decodedFilename });

    // Also delete from local disk if it exists
    const imagesPath = path.join(__dirname, '..', '..', '..', 'images');
    const filePath = path.join(imagesPath, decodedFilename);
    try {
      await fs.unlink(filePath);
    } catch (_) {}

    if (result.deletedCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Image not found in database'
      });
    }

    res.json({
      success: true,
      message: 'Image deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting image:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting image',
      error: error.message
    });
  }
};

module.exports = {
  getAllImages,
  uploadImages,
  deleteImage,
  upload
};
