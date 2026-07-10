const mongoose = require('mongoose');
const SiteConfig = require('../src/models/SiteConfig');
require('dotenv').config({ path: './config.env' });

// MongoDB connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.DATABASE || 'mongodb://localhost:27017/ecommerce', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// Features Section seed data
const featuresData = {
  title: 'Why Choose Us',
  subtitle: 'Discover what makes us special',
  enabled: true,
  features: [
    {
      icon: 'Truck',
      title: 'Fast & Free Shipping',
      description: 'Get your orders delivered swiftly with free shipping on select items.',
      image: ''
    },
    {
      icon: 'Headphones',
      title: '24/7 Customer Support',
      description: 'We are here to help you anytime, anywhere.',
      image: ''
    },
    {
      icon: 'RotateCcw',
      title: 'Easy Returns',
      description: 'Hassle-free returns on eligible products. Check product page for details.',
      image: ''
    },
    {
      icon: 'ShieldCheck',
      title: 'Secure Payments',
      description: 'All transactions are protected using industry-grade security standards.',
      image: ''
    }
  ]
};

// Seed function
const seedFeaturesSection = async () => {
  try {
    console.log('🌱 Starting Features Section seeding...');

    // FIX-BE-SEED: C-7 Write to consolidated key:'all' document instead of per-key 'homepage'
    let allConfig = await SiteConfig.findOne({ key: 'all' });
    
    if (allConfig) {
      // Update existing consolidated config
      if (!allConfig.config.homepage) {
        allConfig.config.homepage = {};
      }
      allConfig.config.homepage.featuresSection = featuresData;
      await allConfig.save();
      console.log('✅ Added/updated Features Section in consolidated config (key:all → homepage.featuresSection)');
    } else {
      // Create new consolidated config with homepage.featuresSection
      const newAllConfig = new SiteConfig({
        key: 'all',
        config: {
          homepage: {
            featuresSection: featuresData,
            hotDealsSection: {
              title: 'Hot Deals',
              subtitle: 'Check out our latest offers and save big!',
              enabled: true,
              productIds: []
            },
            testimonialSection: {
              title: 'What Our Customers Say',
              navigationLabels: { previous: 'Previous', next: 'Next' },
              testimonials: []
            },
            featuredCollections: {
              title: 'Featured Collections',
              collections: []
            }
          }
        },
        version: 1,
        isActive: true
      });
      
      await newAllConfig.save();
      console.log('✅ Created new consolidated config with Features Section');
    }

    console.log('🎉 Features Section seeding completed successfully!');
    
    // Display the seeded data
    const updatedConfig = await SiteConfig.findOne({ key: 'all' });
    console.log('\n📋 Current Features Section data:');
    if (updatedConfig && updatedConfig.config && updatedConfig.config.homepage) {
      console.log(JSON.stringify(updatedConfig.config.homepage.featuresSection, null, 2));
    } else {
      console.log('   (config not found)');
    }
    
  } catch (error) {
    console.error('❌ Error seeding Features Section:', error);
  }
};

// Main execution
const main = async () => {
  await connectDB();
  await seedFeaturesSection();
  await mongoose.connection.close();
  console.log('🔌 Database connection closed');
  process.exit(0);
};

// Run the script
if (require.main === module) {
  main().catch(error => {
    console.error('❌ Script execution failed:', error);
    process.exit(1);
  });
}

module.exports = { seedFeaturesSection, featuresData };
