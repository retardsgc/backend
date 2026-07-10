const mongoose = require('mongoose');
const fs = require('fs').promises;
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.join(__dirname, '..', 'config.env') });

const Image = require('../src/models/Image');

const DB = process.env.DATABASE || 'mongodb://localhost:27017/ecommerce';
const imagesDir = path.join(__dirname, '..', '..', 'images');

const imageExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg', '.webp', '.ico'];

async function getMimeType(filePath, ext) {
  try {
    const mime = require('mime-types');
    const detected = mime.lookup(filePath);
    if (detected) return detected;
  } catch (_) {}
  
  // Custom fallback mapping
  const mapping = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.webp': 'image/webp',
    '.ico': 'image/x-icon'
  };
  return mapping[ext.toLowerCase()] || 'application/octet-stream';
}

async function uploadFile(filePath, relativeName) {
  try {
    const ext = path.extname(filePath).toLowerCase();
    if (!imageExtensions.includes(ext)) return;

    const data = await fs.readFile(filePath);
    const contentType = await getMimeType(filePath, ext);
    const size = data.length;

    // Normalize relativeName to use forward slashes for URLs
    const normalizedName = relativeName.replace(/\\/g, '/');

    await Image.findOneAndUpdate(
      { name: normalizedName },
      {
        name: normalizedName,
        data,
        contentType,
        size
      },
      { upsert: true, new: true }
    );
    console.log(`   ✅ Uploaded: ${normalizedName} (${(size / 1024).toFixed(1)} KB)`);
  } catch (err) {
    console.error(`   ❌ Failed to upload ${relativeName}:`, err.message);
  }
}

async function scanDirectory(dir, baseDir = '') {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = baseDir ? path.join(baseDir, entry.name) : entry.name;
    
    if (entry.isDirectory()) {
      await scanDirectory(fullPath, relativePath);
    } else if (entry.isFile()) {
      await uploadFile(fullPath, relativePath);
    }
  }
}

async function seedImages() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(DB);
    console.log('✅ Connected to MongoDB');

    console.log(`\n📂 Scanning directory: ${imagesDir}`);
    await scanDirectory(imagesDir);

    console.log('\n🎉 Image seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
    process.exit(0);
  }
}

seedImages();
