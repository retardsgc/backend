/**
 * patchTestimonials.js
 *
 * Patches the testimonialSection inside the 'all' siteconfig document in
 * MongoDB. The backend serves config from key='all', so that's what we update.
 *
 * Run: node scripts/patchTestimonials.js
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../config.env') });

const MONGO_URI =
  process.env.DATABASE || 'mongodb://localhost:27017/ecommerce';

const SiteConfig = require('../src/models/SiteConfig');

const TESTIMONIAL_DATA = {
  title: 'Happy Clients',
  subtitle: 'See what our satisfied customers have to say about our electronic accessories.',
  enabled: true,
  layout: 'model2',
  navigationLabels: {
    previous: 'Previous',
    next: 'Next',
  },
  testimonials: [
    {
      name: 'Robert Smith',
      role: 'Customer from USA',
      text: 'I always find something stylish and affordable on this web fashion site.',
      rating: 5,
      heading: 'Best Online Fashion Site',
      productName: '3-in-1 Wireless Charger',
      productPrice: '$105.95',
      productImage: '/images/three-device-wireless-charger.png',
      productLink: '/products',
    },
    {
      name: 'Allen Lyn',
      role: 'Customer from France',
      text: 'I love the variety of styles and the high-quality clothing on this web fashion site.',
      rating: 5,
      heading: 'Great Selection and Quality',
      productName: 'Wireless Earbuds Pro',
      productPrice: '$129.99',
      productImage: '/images/wireless-white-beats-earbuds.png',
      productLink: '/products',
    },
    {
      name: 'Peter Rope',
      role: 'Customer from USA',
      text: 'I finally found a web fashion site with stylish and flattering options in my size.',
      rating: 5,
      heading: 'Best Customer Service',
      productName: 'Phone Case',
      productPrice: '$24.99',
      productImage: '/images/phone-case.png',
      productLink: '/products',
    },
    {
      name: 'Hellen Ase',
      role: 'Customer from Japan',
      text: 'Amazing products every time. The quality never disappoints and shipping is fast.',
      rating: 5,
      heading: 'Consistently Great Quality',
      productName: 'Red Beats AirPods',
      productPrice: '$159.99',
      productImage: '/images/red-beats-airpods.png',
      productLink: '/products',
    },
    {
      name: 'Sophia Kim',
      role: 'Customer from South Korea',
      text: 'Absolutely love the smart watch! Great battery life and accurate fitness tracking.',
      rating: 5,
      heading: 'Amazing Smart Watch!',
      productName: 'Smart Watch Series Pro',
      productPrice: '$299.99',
      productImage: '/images/smart-watch-strap.png',
      productLink: '/products',
    },
  ],
};

async function patchTestimonials() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.host}`);

    // ── The backend serves from key='all' ────────────────────────────────────
    const allDoc = await SiteConfig.findOne({ key: 'all', isActive: true });

    if (!allDoc) {
      console.error('❌ No document found with key="all". Cannot patch.');
      console.log('   Tip: Make sure your backend has seeded the siteconfig first.');
      process.exit(1);
    }

    console.log(`📄 Found "all" document (id: ${allDoc._id})`);

    // Deep-merge: keep everything in config but replace homepage.testimonialSection
    const updatedConfig = { ...allDoc.config };

    // Ensure homepage object exists
    updatedConfig.homepage = updatedConfig.homepage || {};

    // Patch only testimonialSection, preserving other homepage fields
    updatedConfig.homepage.testimonialSection = TESTIMONIAL_DATA;

    await SiteConfig.updateOne(
      { key: 'all' },
      { $set: { config: updatedConfig } }
    );

    console.log('✅ Patched testimonialSection in the "all" config document.');

    // Verify
    const result = await SiteConfig.findOne({ key: 'all' });
    const ts = result?.config?.homepage?.testimonialSection;

    if (!ts) {
      console.error('❌ Verification failed — testimonialSection not found after patch.');
      process.exit(1);
    }

    console.log('\n📊 Testimonials now in DB (key="all"):');
    console.log(`   Layout   : ${ts.layout}`);
    console.log(`   Enabled  : ${ts.enabled}`);
    console.log(`   Count    : ${ts.testimonials?.length}`);
    ts.testimonials?.forEach((t, i) => {
      console.log(`   [${i + 1}] ${t.name.padEnd(15)} | ${t.heading?.padEnd(30)} | ${t.productImage}`);
    });

    console.log('\n🎉 Done! Refresh http://localhost:5177 to see updated testimonials.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

patchTestimonials();
