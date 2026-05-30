process.chdir('d:/farmcy_kart/backend');
require('./config/env');
const {connectDB} = require('./config/db');
const Order = require('./models/Order');
const Customer = require('./models/Customer');

connectDB().then(async () => {
  const shiprocketOrder = await Order.findOne({'shiprocket.order_id': {$exists: true, $ne: null}}).select('_id invoice status shiprocket').lean();
  if (shiprocketOrder) {
    console.log('=== Order with Shiprocket data ===');
    console.log('  invoice:', shiprocketOrder.invoice);
    console.log('  status:', shiprocketOrder.status);
    console.log('  shiprocket.order_id:', shiprocketOrder.shiprocket?.order_id);
    console.log('  shiprocket.shipment_id:', shiprocketOrder.shiprocket?.shipment_id);
    console.log('  shiprocket.awb_code:', shiprocketOrder.shiprocket?.awb_code);
    console.log('  shiprocket.last_synced:', shiprocketOrder.shiprocket?.last_synced);
  } else {
    console.log('No orders with Shiprocket data found in DB');
  }

  const count = await Order.countDocuments();
  const refundedCount = await Order.countDocuments({status: 'Refunded'});
  const refundRequestedCount = await Order.countDocuments({status: 'Refund Requested'});
  const deliveredCount = await Order.countDocuments({status: 'Delivered'});
  const placedCount = await Order.countDocuments({status: 'Order Placed'});
  const pendingCount = await Order.countDocuments({status: 'Pending'});
  
  console.log('=== DB Order Stats ===');
  console.log('Total orders:', count);
  console.log('Order Placed:', placedCount);
  console.log('Pending:', pendingCount);
  console.log('Delivered:', deliveredCount);
  console.log('Refund Requested:', refundRequestedCount);
  console.log('Refunded:', refundedCount);
  
  const fcmCount = await Customer.countDocuments({fcmToken: {$exists: true, $ne: null}});
  const totalCustomers = await Customer.countDocuments();
  console.log('=== Customer Stats ===');
  console.log('Total customers:', totalCustomers);
  console.log('Customers with FCM token:', fcmCount);
  
  const refundEmailSentCount = await Order.countDocuments({refundEmailSent: true});
  const withStatusHistory = await Order.countDocuments({'statusHistory.0': {$exists: true}});
  const withTrackingHistory = await Order.countDocuments({'trackingHistory.0': {$exists: true}});
  console.log('=== Data Integrity ===');
  console.log('Orders with refundEmailSent=true:', refundEmailSentCount);
  console.log('Orders with statusHistory entries:', withStatusHistory);
  console.log('Orders with trackingHistory entries:', withTrackingHistory);
  
  process.exit(0);
}).catch(e => { console.log('DB error:', e.message); process.exit(1); });
