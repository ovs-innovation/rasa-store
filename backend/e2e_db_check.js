require('./config/env');
const {connectDB} = require('./config/db');

// Models
const Customer = require('./models/Customer');
const Order = require('./models/Order');
const Product = require('./models/Product');
const Coupon = require('./models/Coupon');
const Admin = require('./models/Admin');

connectDB().then(async () => {
  console.log('=== DATABASE VERIFICATION START ===');

  // Customer
  const customer = await Customer.findOne().sort({createdAt: -1}).lean();
  console.log('Customer Schema Check:', !!customer);
  
  // Addresses
  if (customer && customer.shippingAddress && customer.shippingAddress.length > 0) {
     console.log('Customer Address Exists:', true);
  } else {
     console.log('Customer Address Exists:', false);
  }

  // Coupon
  const coupon = await Coupon.findOne().lean();
  console.log('Coupon Exists:', !!coupon);

  // Orders
  const orderCount = await Order.countDocuments();
  console.log('Total Orders:', orderCount);

  // Shiprocket Orders
  const srOrder = await Order.findOne({'shiprocket.order_id': { $exists: true, $ne: null }}).lean();
  console.log('Shiprocket Order Exists:', !!srOrder);

  // Products
  const productCount = await Product.countDocuments();
  console.log('Total Products:', productCount);

  // Admin
  const adminExists = await Admin.findOne().lean();
  console.log('Admin Exists:', !!adminExists);

  console.log('=== DATABASE VERIFICATION END ===');
  process.exit(0);
}).catch(e => {
  console.log('Error:', e.message);
  process.exit(1);
});
