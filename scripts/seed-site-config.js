const mongoose = require('mongoose');
const dotenv = require('dotenv');
const SiteConfig = require('../src/models/SiteConfig');

// Load environment variables
dotenv.config({ path: './config.env' });

const siteConfigs = [
  {
    key: 'all',
    config: {
      branding: {
        name: 'Ecomus',
        siteName: 'Ecomus',
        logo: {
          light: '/logo.svg',
          dark: '/logo-dark.svg',
          alt: 'Ecomus Logo',
        },
        faviconUrl: '/favicon.ico',
        colors: {
          primary: '#3b82f6',
          secondary: '#6b7280',
          accent: '#ef4444',
          neutral: '#f3f4f6',
        },
      },
      navigation: {
        mainMenu: [
          { name: 'Home', link: '/' },
          { name: 'Shop', link: '/shop' },
          { name: 'About', link: '/about' },
          { name: 'Contact', link: '/contact' },
        ],
        footerNav: [
          { text: 'Privacy Policy', href: '/privacy' },
          { text: 'Terms of Service', href: '/terms' },
        ],
      },
      announcementbar: {
        enabled: true,
        text: 'Free shipping on all orders over ₹500!',
        backgroundColor: '#2c3bc5',
        textColor: '#ffffff',
      },
      hero: {
        slides: [
          {
            id: 1,
            heading: 'Premium Quality Nuts & Dry Fruits',
            subheading: '100% natural, fresh, and handpicked premium nuts delivered straight to your doorstep.',
            button: 'Shop Now',
            buttonLink: '/products',
            image: '/images/hero-1.png',
          },
          {
            id: 2,
            heading: 'Power Up Your Energy',
            subheading: 'Discover our delicious selection of premium almonds, cashews, and dates to boost your daily nutrition.',
            button: 'Discover More',
            buttonLink: '/products',
            image: '/images/hero-2.png',
          },
          {
            id: 3,
            heading: 'Gourmet Healthy Snacking',
            subheading: 'Explore our roasted, salted, and mixed varieties for the perfect guilt-free treat.',
            button: 'Browse Products',
            buttonLink: '/products',
            image: '/images/hero-3.png',
          },
        ],
      },
      homepage: {
        hotDealsSection: {
          title: 'Hot Deals',
          subtitle: 'Check out our latest offers and save big!',
        },
        featuresSection: {
          title: 'Why shop with NutriNuts',
          subtitle: 'Premium services to make your shopping seamless',
          features: [
            { icon: 'truck', title: 'Fast & Free Shipping', description: 'Get your orders delivered swiftly with free shipping on select items.' },
            { icon: 'headphones', title: '24/7 Customer Support', description: 'We are here to help you anytime, anywhere.' },
            { icon: 'refresh', title: 'Easy Returns', description: 'Hassle-free returns on eligible products. Check product page for details.' },
            { icon: 'shield', title: 'Secure Payments', description: 'Your transactions are protected with top-grade security.' }
          ]
        },
        testimonialSection: {
          title: 'What our customers say',
          navigationLabels: { previous: 'Previous', next: 'Next' },
          testimonials: [
            { name: 'Alex Johnson', role: 'Verified Buyer', rating: 5, text: 'Fantastic quality and fast delivery. Highly recommend!' },
            { name: 'Sara Lee', role: 'Loyal Customer', rating: 5, text: 'Great customer service and amazing deals.' },
            { name: 'Michael Chen', role: 'New Customer', rating: 4, text: 'Smooth shopping experience and easy returns.' }
          ]
        },
        featuredCollections: {
          title: "Featured Collections",
          enabled: true,
          collections: [
            {
              id: 1,
              title: "Premium Cashews W240",
              subtitle: "Raw, creamy, and large size",
              description: "Sourced from the finest orchards in Kerala, our whole cashews are the gold standard of quality.",
              image: "/images/cashew-1.png",
              buttonText: "Shop Cashews",
              buttonLink: "/products",
              gradient: "from-black/60 to-black/20"
            },
            {
              id: 2,
              title: "California Premium Almonds",
              subtitle: "Direct from the finest valley",
              description: "Rich in Vitamin E and antioxidants, these crunchy almonds make the perfect daily superfood.",
              image: "/images/almond-1.png",
              buttonText: "Shop Almonds",
              buttonLink: "/products",
              gradient: "from-black/60 to-black/20"
            }
          ]
        }
      },
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
        sections: [
          {
            title: 'Company',
            links: [
              { name: 'About Us', link: '/about' },
              { name: 'Careers', link: '/careers' },
              { name: 'Press', link: '/press' }
            ]
          },
          {
            title: 'Support',
            links: [
              { name: 'Contact Us', link: '/contact' },
              { name: 'FAQ', link: '/faq' },
              { name: 'Shipping & Returns', link: '/shipping-returns' }
            ]
          }
        ]
      },
      company: {
        address: {
          street: "123 Main Street",
          city: "Anytown",
          state: "CA",
          zip: "12345"
        },
        contact: {
          email: "contact@example.com",
          phone: "123-456-7890"
        }
      },
      contactUs: {
        pageTitle: 'Contact Us',
        sectionTitle: 'Visit Our Store',
        formTitle: 'Get in Touch',
        formDescription: "If you've got great products your making or looking to work with us then drop us a line.",
        address: '66 Mott St, New York, New York, Zip Code: 10006, AS',
        phone: '(623) 934-2400',
        email: 'EComposer@example.com',
        businessHoursTitle: 'Open Time',
        businessHours: 'Our store has re-opened for shopping,\nexchange Every day 11am to 7pm',
        socialMedia: [
          {
            name: 'Facebook',
            url: 'https://facebook.com',
            icon: 'facebook'
          },
          {
            name: 'Twitter',
            url: 'https://twitter.com',
            icon: 'twitter'
          },
          {
            name: 'Instagram',
            url: 'https://instagram.com',
            icon: 'instagram'
          }
        ]
      }
    }
  }
];

const seedDB = async () => {
  try {
    const db = process.env.DATABASE;
    if (!db) {
      console.error('DATABASE connection string not found in config.env');
      process.exit(1);
    }

    await mongoose.connect(db, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log('MongoDB connected...');

    console.log('Clearing existing site configs...');
    await SiteConfig.deleteMany({});
    console.log('Site configs cleared.');

    console.log('Seeding new site configs...');
    await SiteConfig.insertMany(siteConfigs);
    console.log('Site configs seeded successfully.');

  } catch (err) {
    console.error('Error seeding database:', err.message);
  } finally {
    mongoose.connection.close();
    console.log('MongoDB connection closed.');
  }
};

seedDB();
