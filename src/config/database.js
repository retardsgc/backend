const mongoose = require('mongoose');

const getDbCandidates = () => {
  const configuredDB = process.env.DATABASE || process.env.MONGODB_URI;
  const localCandidates = [
    process.env.DATABASE_LOCAL,
    'mongodb://localhost:27017/ecommerce',
    'mongodb://localhost:28000/ecommerce',
    'mongodb://127.0.0.1:27017/ecommerce',
    'mongodb://127.0.0.1:28000/ecommerce'
  ].filter(Boolean);

  if (process.env.USE_LOCAL_DB === 'true') {
    return configuredDB ? [...localCandidates, configuredDB] : localCandidates;
  }
  return configuredDB ? [configuredDB, ...localCandidates] : localCandidates;
};

// MongoDB connection configuration
const connectDB = async () => {
  const dbCandidates = getDbCandidates();
  let lastError = null;

  for (const dbUri of dbCandidates) {
    try {
      const conn = await mongoose.connect(dbUri, {
        serverSelectionTimeoutMS: 5000 // 5 seconds timeout for faster fallback
      });

      console.log(`MongoDB Connected: ${conn.connection.host}:${conn.connection.port}`);
      console.log(`Database: ${conn.connection.name}`);
      return conn;
    } catch (error) {
      lastError = error;
      console.error(`MongoDB connection attempt failed for ${dbUri}:`, error.message);
    }
  }

  console.error('MongoDB connection error:', lastError.message);
  process.exit(1);
};

// Connection event handlers
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected from MongoDB');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  try {
    await mongoose.connection.close();
    console.log('MongoDB connection closed through app termination');
    process.exit(0);
  } catch (error) {
    console.error('Error during MongoDB disconnection:', error);
    process.exit(1);
  }
});

module.exports = {
  connectDB,
  mongoose
};
