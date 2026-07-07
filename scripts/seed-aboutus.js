const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

// Load environment variables from config.env
dotenv.config({ path: path.join(__dirname, '../config.env') });

const SiteConfig = require('../src/models/SiteConfig');

const aboutUsData = {
  heroTitle: 'About Us',
  storyTitle: 'Our Story',
  storyParagraphs: [
    'Welcome to NutriNuts, your premier destination for the finest quality nuts, dried fruits, and healthy snacks. Founded with a simple mission: to make premium, wholesome nutrition accessible and enjoyable for everyone.',
    'What began as a passion for sourcing the healthiest snacks has grown into a trusted brand serving thousands of health-conscious families. We believe in the power of natural whole foods to fuel active, vibrant lifestyles.',
    'Our team is dedicated to handpicking only the freshest, premium-grade crops, ensuring sustainable sourcing and delivering exceptional farm-to-table goodness.'
  ],
  storyImage: '/images/granola-bowl.png',
  missionTitle: 'Our Mission',
  missionText: 'Our mission is to provide high-quality, nutritious nuts and dried fruits at competitive prices while delivering an exceptional shopping experience. We are committed to health, customer satisfaction, and promoting wholesome living.',
  valuesTitle: 'Our Values',
  values: [
    {
      icon: 'quality',
      title: 'Quality First',
      description: 'We carefully select every batch of nuts and fruits to ensure they meet our high standards of freshness and premium quality.'
    },
    {
      icon: 'customer',
      title: 'Customer Focused',
      description: 'Your satisfaction is our priority. We go above and beyond to provide excellent service and support.'
    },
    {
      icon: 'innovation',
      title: 'Wholesome Living',
      description: 'We stay dedicated to promoting healthy habits and natural snacking options for individuals and families.'
    }
  ],
  statsEnabled: true,
  stats: [
    {
      value: '10,000+',
      label: 'Happy Customers'
    },
    {
      value: '500+',
      label: 'Products Available'
    },
    {
      value: '50+',
      label: 'Cities Served'
    },
    {
      value: '4.8/5',
      label: 'Customer Rating'
    }
  ],
  ctaTitle: 'Ready to Start Shopping?',
  ctaText: 'Discover our wide range of premium raw, roasted, and mixed dry fruits. Shop with confidence knowing you are getting the absolute best in natural nutrition.',
  ctaButtonText: 'Browse Products',
  ctaButtonLink: '/shop'
};

async function seedAboutUs() {
  try {
    // Connect to MongoDB
    const mongoUri = process.env.DATABASE || 'mongodb://localhost:28000/ecommerce';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');

    // Check if aboutUs config already exists
    let aboutUsConfig = await SiteConfig.findOne({ key: 'aboutUs' });

    if (aboutUsConfig) {
      // Update existing
      aboutUsConfig.config = aboutUsData;
      await aboutUsConfig.save();
      console.log('✅ About Us config updated in SiteConfig');
    } else {
      // Create new
      aboutUsConfig = new SiteConfig({
        key: 'aboutUs',
        config: aboutUsData,
        isActive: true
      });
      await aboutUsConfig.save();
      console.log('✅ About Us config created in SiteConfig');
    }

    console.log('✅ About Us data seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding About Us:', error);
    process.exit(1);
  }
}

seedAboutUs();
