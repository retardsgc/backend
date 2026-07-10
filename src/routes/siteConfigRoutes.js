const express = require('express');
const {
  getSiteConfig,
  upsertSiteConfig,
  deleteSiteConfig,
  createBackup,
  getBackups,
  restoreFromBackup,
  validateSiteConfig,
  getConfigHistory
} = require('../controllers/siteConfigController');

const { protectAdmin } = require('../middleware/adminAuth'); // FIX-BE-ROUTES: C-3

const router = express.Router();

// @route   POST /api/siteconfig/backup
// @desc    Create backup of current site configuration
// @access  Private (TODO: add authentication middleware)
router.post('/backup', protectAdmin, createBackup); // FIX-BE-ROUTES: C-3

// @route   GET /api/siteconfig/backups
// @desc    Get all backups
// @access  Private (TODO: add authentication middleware)
router.get('/backups', protectAdmin, getBackups); // FIX-BE-ROUTES: C-3

// @route   POST /api/siteconfig/restore/:backupKey
// @desc    Restore from backup
// @access  Private (TODO: add authentication middleware)
router.post('/restore/:backupKey', protectAdmin, restoreFromBackup); // FIX-BE-ROUTES: C-3

// @route   POST /api/siteconfig/validate
// @desc    Validate site configuration data
// @access  Private (TODO: add authentication middleware)
router.post('/validate', protectAdmin, validateSiteConfig); // FIX-BE-ROUTES: C-3

// @route   GET /api/siteconfig/history
// @desc    Get configuration history/versions
// @access  Private (TODO: add authentication middleware)
router.get('/history', protectAdmin, getConfigHistory); // FIX-BE-ROUTES: C-3

// @route   GET /api/siteconfig
// @desc    Get all site configurations
// @access  Public
router.get('/', getSiteConfig);

// @route   GET /api/siteconfig/:key
// @desc    Get specific site configuration by key
// @access  Public
router.get('/:key', getSiteConfig);

// @route   PUT /api/siteconfig
// @desc    Update consolidated site config (no key param - treats as 'all')
// @access  Private
router.put('/', protectAdmin, upsertSiteConfig); // FIX-BE-ROUTES: C-3

// @route   POST /api/siteconfig/:key
// @desc    Create or update site configuration
// @access  Private (TODO: add authentication middleware)
router.post('/:key', protectAdmin, upsertSiteConfig); // FIX-BE-ROUTES: C-3

// @route   PUT /api/siteconfig/:key
// @desc    Update site configuration
// @access  Private (TODO: add authentication middleware)
router.put('/:key', protectAdmin, upsertSiteConfig); // FIX-BE-ROUTES: C-3

// @route   DELETE /api/siteconfig/:key
// @desc    Delete site configuration
// @access  Private (TODO: add authentication middleware)
router.delete('/:key', protectAdmin, deleteSiteConfig); // FIX-BE-ROUTES: C-3

module.exports = router;
