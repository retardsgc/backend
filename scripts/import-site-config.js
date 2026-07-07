/**
 * Import site config JSON into MongoDB
 * Usage: node scripts/import-site-config.js path/to/site-config.json
 */

const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '../config.env') });

const SiteConfig = require('../src/models/SiteConfig');

const DB_CANDIDATES = [
  process.env.DATABASE,
  'mongodb://localhost:28000/ecommerce',
  'mongodb://localhost:27017/ecommerce',
].filter(Boolean);

async function connectDB() {
  for (const uri of DB_CANDIDATES) {
    try {
      await mongoose.connect(uri, { serverSelectionTimeoutMS: 3000 });
      console.log(`✅ Connected to MongoDB: ${uri}`);
      return;
    } catch (_) {
      // try next
    }
  }
  throw new Error('Could not connect to any MongoDB instance');
}

async function importConfig() {
  // Get JSON file path from argument
  const filePath = process.argv[2];

  if (!filePath) {
    console.error('❌ Usage: node scripts/import-site-config.js <path-to-json-file>');
    console.error('   Example: node scripts/import-site-config.js site-config-2026-04-23.json');
    process.exit(1);
  }

  const absPath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absPath)) {
    console.error(`❌ File not found: ${absPath}`);
    process.exit(1);
  }

  let configData;
  try {
    const raw = fs.readFileSync(absPath, 'utf-8');
    configData = JSON.parse(raw);
    console.log(`✅ Read JSON file: ${absPath}`);
  } catch (err) {
    console.error(`❌ Failed to parse JSON: ${err.message}`);
    process.exit(1);
  }

  await connectDB();

  // Check if an existing config exists and back it up
  const existing = await SiteConfig.findOne({ key: 'all' });
  if (existing && Object.keys(existing.config || {}).length > 0) {
    const backupKey = `backup_before_import_${Date.now()}`;
    await SiteConfig.create({
      key: backupKey,
      config: existing.config,
      version: existing.version,
      isActive: false
    });
    console.log(`📦 Backed up existing config as: ${backupKey}`);
  }

  // Save the imported config
  const result = await SiteConfig.findOneAndUpdate(
    { key: 'all' },
    { key: 'all', config: configData, version: 1, isActive: true },
    { new: true, upsert: true, runValidators: false }
  );

  console.log('\n✅ Site config imported successfully!');
  console.log(`   Key: ${result.key}`);
  console.log(`   Updated At: ${result.updatedAt}`);
  console.log(`   Config sections: ${Object.keys(result.config || {}).join(', ')}`);
  console.log('\n🔄 Refresh the admin panel to see the changes.');

  await mongoose.disconnect();
  process.exit(0);
}

importConfig().catch((err) => {
  console.error('❌ Error:', err.message);
  process.exit(1);
});
