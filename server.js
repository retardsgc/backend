// Trigger restart for database migration - brand new Atlas cluster
const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: './config.env' });

const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const AppError = require('./src/utils/appError');
const globalErrorHandler = require('./src/controllers/errorController');
const { apiLimiter, authLimiter, createAccountLimiter, passwordResetLimiter } = require('./src/middleware/rateLimiter');

const app = express();

// Trust proxy (required for rate limiting behind Render's load balancer)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configuration
const isPrivateNetworkOrigin = (origin) => {
  try {
    const parsed = new URL(origin);
    const host = parsed.hostname;

    if (host === 'localhost' || host === '127.0.0.1') return true;
    if (host.startsWith('192.168.')) return true;
    if (host.startsWith('10.')) return true;

    const match = host.match(/^172\.(\d+)\./);
    if (match) {
      const secondOctet = Number(match[1]);
      if (secondOctet >= 16 && secondOctet <= 31) return true;
    }

    return false;
  } catch {
    return false;
  }
};

const normalizeOrigin = (value) => {
  if (!value) return '';
  return String(value).trim().replace(/\/$/, '');
};

const fallbackOrigins = [
  process.env.FRONTEND_URL,
  process.env.ADMIN_FRONTEND_URL,
  'https://nutrinuts-store.vercel.app',
  'https://nutrinuts-admin.vercel.app',
  'https://frontend-three-eta-33.vercel.app',
  'https://adminfrontend-pi-rosy.vercel.app',
  'http://localhost:5173',
  'http://localhost:5177',
  'http://localhost:5178',
  'http://localhost:5174',
  'http://localhost:8090',
  'http://localhost:8091'
].map(normalizeOrigin).filter(Boolean);

const envOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(normalizeOrigin)
  .filter(Boolean);

const allowedOrigins = new Set([...fallbackOrigins, ...envOrigins]);

const isAllowedVercelPreview = (origin) => {
  try {
    const host = new URL(origin).hostname;
    return host.endsWith('.vercel.app');
  } catch {
    return false;
  }
};

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);

    if (process.env.NODE_ENV !== 'production' && isPrivateNetworkOrigin(origin)) {
      return callback(null, true);
    }

    if (allowedOrigins.has(normalizedOrigin) || isAllowedVercelPreview(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

// Apply general API rate limiting, but keep admin login and stats paths unblocked.
app.use('/api/', (req, res, next) => {
  if (req.path === '/admin-auth/login') return next();
  if (req.path.startsWith('/products/stats')) return next();
  if (req.path.startsWith('/analytics')) return next();
  return apiLimiter(req, res, next);
});

// Lightweight health endpoint for readiness/liveness checks
app.get('/api/health', (req, res) => {
  res.status(200).json({ success: true, message: 'OK' });
});


// Serve static images from MongoDB Atlas first, with fallback to local disk
const Image = require('./src/models/Image');
app.get('/images/:filename(*)', async (req, res, next) => {
  try {
    const filename = req.params.filename;
    const img = await Image.findOne({ name: filename });
    if (img) {
      res.set('Content-Type', img.contentType);
      return res.send(img.data);
    }
  } catch (err) {
    console.error('Error fetching image from MongoDB:', err.message);
  }
  next();
});

const sharedImagesPath = path.join(__dirname, '..', 'images');
app.use('/images', express.static(sharedImagesPath));

// Routes
const productRoutes = require('./src/routes/productRoutes');
const categoryRoutes = require('./src/routes/categoryRoutes');
const siteConfigRoutes = require('./src/routes/siteConfigRoutes');
const userRoutes = require('./src/routes/userRoutes');
const authRoutes = require('./src/routes/authRoutes');
const wishlistRoutes = require('./src/routes/wishlistRoutes');
const cartRoutes = require('./src/routes/cartRoutes');
const imageRoutes = require('./src/routes/imageRoutes');
const customerRoutes = require('./src/routes/customerRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const adminOrderRoutes = require('./src/routes/adminOrderRoutes');
const analyticsRoutes = require('./src/routes/analyticsRoutes');
const addressRoutes = require('./src/routes/addressRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const reviewRoutes = require('./src/routes/reviewRoutes');
const bulkEmailRoutes = require('./src/routes/bulkEmailRoutes');
const exportRoutes = require('./src/routes/exportRoutes');
const paymentSettingsRoutes = require('./src/routes/paymentSettingsRoutes');
const contactRoutes = require('./src/routes/contactRoutes');
const aboutUsRoutes = require('./src/routes/aboutUsRoutes');
const adminAuthRoutes = require('./src/routes/adminAuthRoutes');

// Apply stricter rate limiting to auth routes
app.use('/api/auth/signup', createAccountLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/forgotPassword', passwordResetLimiter);
// Keep admin auth reachable in production; limiter can be re-enabled after proxy tuning.
// app.use('/api/admin-auth', authLimiter);

app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/siteconfig', siteConfigRoutes);
app.use('/api/users', userRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/wishlist', wishlistRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/images', imageRoutes);
app.use('/api/admin/customers', customerRoutes);
app.use('/api/admin/orders', adminOrderRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/admin/emails', bulkEmailRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/payment-settings', paymentSettingsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/aboutus', aboutUsRoutes);
app.use('/api/admin-auth', adminAuthRoutes);

// Root URL welcome/status message
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'NutriNuts E-commerce API is running',
    timestamp: new Date().toISOString()
  });
});

// Handle favicon.ico requests gracefully by serving the icon file
app.get('/favicon.ico', (req, res) => {
  res.setHeader('Content-Type', 'image/svg+xml');
  res.sendFile(path.join(__dirname, 'favicon.ico'));
});

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

const configuredDB = process.env.DATABASE || process.env.MONGODB_URI;
const defaultLocalDB = 'mongodb://localhost:27017/ecommerce';

// Try configured DB first, then fall back to default local MongoDB for easier setup on new machines.
const dbCandidates = configuredDB
  ? [configuredDB, ...(configuredDB !== defaultLocalDB ? [defaultLocalDB] : [])]
  : [defaultLocalDB];

if (!configuredDB) {
  console.warn(`DATABASE/MONGODB_URI not found. Falling back to ${defaultLocalDB}`);
}

const connectDatabase = async () => {
  let lastError = null;

  for (const dbUri of dbCandidates) {
    try {
      await mongoose.connect(dbUri);
      console.log(`DB connection successful! (${dbUri})`);
      return;
    } catch (err) {
      lastError = err;
      console.error(`DB connection attempt failed: ${dbUri}`);
    }
  }

  console.error('DB connection error:', lastError);
  process.exit(1);
};

connectDatabase();

const port = process.env.PORT || 5001;
app.listen(port, () => {
  console.log(`App running on port ${port}...`);
  console.log(`🖼️ Images served from: ${sharedImagesPath} at /api/images`);
});
