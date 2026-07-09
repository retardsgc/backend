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
const Product = require('../src/models/Product');

async function patchTestimonials() {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 8000 });
    console.log(`✅ Connected to MongoDB: ${mongoose.connection.host}`);

    // ── Fetch real products from DB ─────────────────────────────────────────
    const products = await Product.find({}, { name: 1, price: 1, images: 1, _id: 1 }).limit(20);

    if (!products.length) {
      console.error('❌ No products found in DB. Cannot link to real products.');
      process.exit(1);
    }

    console.log(`📦 Found ${products.length} products in DB`);
    products.forEach(p => console.log(`   - ${p.name} | ₹${p.price} | ${p.images[0]}`));

    // Helper: find product by name keyword
    const findProduct = (keyword) =>
      products.find(p => p.name.toLowerCase().includes(keyword.toLowerCase())) || products[0];

    const almonds     = findProduct('almond');
    const cashews     = findProduct('cashew');
    const pistachios  = findProduct('pistachio');
    const dates       = findProduct('date');
    const mixed       = findProduct('mixed');

    const fmt = (p) => `₹${p.price}`;
    const img = (p) => p.images[0];
    const link = (p) => `/product/${p._id}`;

    const TESTIMONIAL_DATA = {
      title: 'Happy Clients',
      subtitle: 'Real stories from our customers who love our premium nuts & dry fruits.',
      enabled: true,
      layout: 'model2',
      navigationLabels: { previous: 'Previous', next: 'Next' },
      testimonials: [
        {
          name: 'Priya Sharma',
          role: 'Customer from Mumbai',
          text: 'The California almonds are absolutely fresh and crunchy. I gift these every Diwali — everyone loves them! Highly recommend.',
          rating: 5,
          heading: 'Best Premium Almonds I\'ve Ever Had!',
          productName: almonds.name,
          productPrice: fmt(almonds),
          productImage: img(almonds),
          productLink: link(almonds),
        },
        {
          name: 'Rahul Verma',
          role: 'Customer from Delhi',
          text: 'These cashews are so perfectly roasted. The pepper flavour is addictive! Great packaging and delivered super fast.',
          rating: 5,
          heading: 'Perfectly Roasted, Great Flavour!',
          productName: cashews.name,
          productPrice: fmt(cashews),
          productImage: img(cashews),
          productLink: link(cashews),
        },
        {
          name: 'Sunita Patel',
          role: 'Customer from Ahmedabad',
          text: 'Best pistachios I have ordered online. Authentic taste, great freshness, and a generous quantity for the price. Will order again.',
          rating: 5,
          heading: 'Authentic & Fresh Every Time',
          productName: pistachios.name,
          productPrice: fmt(pistachios),
          productImage: img(pistachios),
          productLink: link(pistachios),
        },
        {
          name: 'Meera Nair',
          role: 'Customer from Kochi',
          text: 'The Medjool dates taste just like the ones from the market, but way more convenient. Superb quality and sealed freshness.',
          rating: 5,
          heading: 'Sweet, Fresh & Convenient!',
          productName: dates.name,
          productPrice: fmt(dates),
          productImage: img(dates),
          productLink: link(dates),
        },
        {
          name: 'Arjun Mehta',
          role: 'Customer from Bangalore',
          text: 'The Premium Mixed Dry Fruits pack is a daily staple at home now. Great value for money and the quality is always consistent.',
          rating: 5,
          heading: 'My Daily Healthy Snack!',
          productName: mixed.name,
          productPrice: fmt(mixed),
          productImage: img(mixed),
          productLink: link(mixed),
        },
      ],
    };

    // ── Patch the 'all' document ────────────────────────────────────────────
    const allDoc = await SiteConfig.findOne({ key: 'all', isActive: true });

    if (!allDoc) {
      console.error('❌ No document found with key="all". Cannot patch.');
      process.exit(1);
    }

    const updatedConfig = {
      ...allDoc.config,
      homepage: {
        ...(allDoc.config.homepage || {}),
        testimonialSection: TESTIMONIAL_DATA,
      },
    };

    await SiteConfig.updateOne({ key: 'all' }, { $set: { config: updatedConfig } });

    console.log('\n✅ Patched testimonialSection in the "all" config.');

    // Verify
    const result = await SiteConfig.findOne({ key: 'all' });
    const ts = result?.config?.homepage?.testimonialSection;

    console.log('\n📊 Final testimonials in DB:');
    console.log(`   Layout  : ${ts?.layout}`);
    console.log(`   Count   : ${ts?.testimonials?.length}`);
    ts?.testimonials?.forEach((t, i) => {
      console.log(`   [${i + 1}] ${t.name.padEnd(16)} | ${t.productName.padEnd(30)} | ${t.productLink}`);
    });

    console.log('\n🎉 Done! Refresh the storefront to see updated testimonials.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
}

patchTestimonials();
