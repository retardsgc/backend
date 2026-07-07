const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../config.env') });

const Order = require('../src/models/Order');

async function updateOrderToDelivered() {
  try {
    await mongoose.connect(process.env.DATABASE);
    console.log('Connected to MongoDB');

    // Find the latest order that has a user (belongs to a customer)
    const order = await Order.findOne({ user: { $exists: true, $ne: null } })
      .sort({ createdAt: -1 });

    if (order) {
      order.status = 'delivered';
      await order.save();
      console.log(`Order ${order._id} updated to delivered`);
      console.log(`Order belongs to user: ${order.user}`);
    } else {
      console.log('No order found with a user');
    }

    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

updateOrderToDelivered();
