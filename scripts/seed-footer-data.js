const mongoose = require('mongoose');
const SiteConfig = require('../src/models/SiteConfig');

// Enhanced footer configuration
const footerConfig = {
  footer: {
    copyright: '© 2024 NutriNuts. All Rights Reserved.',
    getDirectionText: 'Get Direction',
    getDirectionLink: 'https://www.google.com/maps',
    newsletter: {
      title: 'Join Our Newsletter',
      description: 'Get exclusive deals and updates straight to your inbox.',
      placeholder: 'Enter your email',
      buttonText: 'Subscribe'
    },
    socialMedia: {
      youtube: { url: 'https://youtube.com/@nutrinuts', enabled: true },
      facebook: { url: 'https://facebook.com/nutrinuts', enabled: true },
      instagram: { url: 'https://instagram.com/nutrinuts', enabled: true },
      telegram: { url: 'https://t.me/nutrinuts', enabled: true }
    },
    sections: [
      {
        title: 'Company',
        links: [
          { name: 'About Us', link: '/about' },
          { name: 'Shop', link: '/shop' },
          { name: 'Contact Us', link: '/contact' }
        ]
      },
      {
        title: 'Support',
        links: [
          { name: 'FAQ', link: '/faq' },
          { name: 'My Account', link: '/account' },
          { name: 'Policies', link: '/policies' }
        ]
      }
    ]
  },
  company: {
    address: {
      street: '123 Market Street',
      city: 'Mumbai',
      state: 'Maharashtra',
      zip: '400001'
    },
    contact: {
      email: 'info@nutrinuts.com',
      phone: '+91 98765 43210'
    }
  }
  
};


async function seedFooterData() {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.DATABASE || 'mongodb://localhost:27017/ecommerce');
    console.log('✅ Connected to MongoDB');

    // Find or create the main site config
    let siteConfig = await SiteConfig.findOne({ key: 'all', isActive: true });
    
    if (!siteConfig) {
      console.log('❌ No site config found with key "all". Creating new one...');
      siteConfig = new SiteConfig({
        key: 'all',
        config: footerConfig,
        version: 1,
        isActive: true
      });
    } else {
      console.log('✅ Found existing site config. Updating footer data...');
      // Merge the footer config with existing config
      siteConfig.config = {
        ...siteConfig.config,
        footer: footerConfig.footer
      };
      siteConfig.version = (siteConfig.version || 1) + 1;
    }

    // Save the config
    await siteConfig.save();
    console.log('✅ Footer data seeded successfully!');
    
    // Display the updated config
    console.log('\n📋 Footer Configuration:');
    console.log(JSON.stringify(siteConfig.config.footer, null, 2));
    // Verify the data
    const verification = await SiteConfig.findOne({ key: 'all', isActive: true });
    if (verification && verification.config.footer) {
      console.log('\n✅ Data verification successful - Footer data is properly stored!');
    } else {
      console.log('\n❌ Data verification failed - Please check the database');
    }

  } catch (error) {
    console.error('❌ Error seeding footer data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
  }
}

// Run the seeding
seedFooterData();
