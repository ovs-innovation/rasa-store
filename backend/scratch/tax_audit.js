const path = require('path');
const backendDir = path.resolve(__dirname, '..');
process.chdir(backendDir);
const dotenv = require('dotenv');
dotenv.config({ path: path.join(backendDir, '.env') });
const {connectDB} = require('./config/db');
const Product = require('./models/Product');
const Order = require('./models/Order');
const Tax = require('./models/Tax');

connectDB().then(async () => {
  // 1. Products with tax
  const products = await Product.find({ taxRate: { $gt: 0 } }).select('title taxRate hsnCode prices isPriceInclusive').limit(3).lean();
  console.log('--- PRODUCTS WITH TAX ---');
  console.log(JSON.stringify(products, null, 2));
  
  // 2. Products without tax
  const noTaxProducts = await Product.find({ $or: [{taxRate: 0}, {taxRate: {$exists: false}}] }).select('title taxRate hsnCode prices isPriceInclusive').limit(2).lean();
  console.log('--- PRODUCTS WITHOUT TAX ---');
  console.log(JSON.stringify(noTaxProducts, null, 2));

  // 3. Tax Slabs
  const taxes = await Tax.find({}).lean();
  console.log('--- TAX SLABS ---');
  console.log(JSON.stringify(taxes, null, 2));

  // 4. Orders with Tax
  const orders = await Order.find({ 'taxSummary.totalTax': { $gt: 0 } }).select('invoice taxSummary subTotal total cart').limit(2).lean();
  console.log('--- ORDERS WITH TAX ---');
  console.log(JSON.stringify(orders, null, 2));
  
  // 5. Any orders just to see structure
  const anyOrder = await Order.findOne({}).select('invoice taxSummary subTotal total cart').sort({createdAt: -1}).lean();
  console.log('--- LATEST ORDER ---');
  console.log(JSON.stringify(anyOrder, null, 2));

  process.exit(0);
}).catch(e => {
  console.log('DB Error:', e.message);
  process.exit(1);
});
