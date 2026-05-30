const path = require('path');
const backendDir = path.resolve(__dirname, '..');
process.chdir(backendDir);
const dotenv = require('dotenv');
dotenv.config({ path: path.join(backendDir, '.env') });
const {connectDB} = require('./config/db');
const Order = require('./models/Order');
const Customer = require('./models/Customer');

connectDB().then(async () => {
  // Check orders with Shiprocket data
  const shiprocketOrder = await Order.findOne({'shiprocket.order_id': {$exists:true, $ne:null}}).select('invoice status shiprocket').lean();
  if(shiprocketOrder) {
    console.log('=== Shiprocket Order Found ===');
    console.log(JSON.stringify({
      invoice: shiprocketOrder.invoice,
      status: shiprocketOrder.status,
      sr_order_id: shiprocketOrder.shiprocket && shiprocketOrder.shiprocket.order_id,
      shipment_id: shiprocketOrder.shiprocket && shiprocketOrder.shiprocket.shipment_id,
      awb: shiprocketOrder.shiprocket && shiprocketOrder.shiprocket.awb_code
    }, null, 2));
  } else {
    console.log('No Shiprocket orders found in DB');
  }

  const total = await Order.countDocuments();
  const placed = await Order.countDocuments({status:'Order Placed'});
  const delivered = await Order.countDocuments({status:'Delivered'});
  const refundReq = await Order.countDocuments({status:'Refund Requested'});
  const refunded = await Order.countDocuments({status:'Refunded'});
  const customers = await Customer.countDocuments();
  const withFCM = await Customer.countDocuments({fcmToken: {$exists: true, $ne: null}});
  const refundEmailSent = await Order.countDocuments({refundEmailSent: true});
  const withStatusHistory = await Order.countDocuments({'statusHistory.0': {$exists: true}});
  const withTrackingHistory = await Order.countDocuments({'trackingHistory.0': {$exists: true}});

  console.log('=== DB STATS ===');
  console.log('Total orders:', total);
  console.log('Order Placed:', placed);
  console.log('Delivered:', delivered);
  console.log('Refund Requested:', refundReq);
  console.log('Refunded:', refunded);
  console.log('Total customers:', customers);
  console.log('Customers with FCM token:', withFCM);
  console.log('Orders with refundEmailSent=true:', refundEmailSent);
  console.log('Orders with statusHistory:', withStatusHistory);
  console.log('Orders with trackingHistory:', withTrackingHistory);
  
  process.exit(0);
}).catch(e => {
  console.log('DB Error:', e.message);
  process.exit(1);
});
