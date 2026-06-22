const { connectDB } = require('../backend/config/db');
require('../backend/models/Product');
require('../backend/models/Category');
require('../backend/models/Brand');

async function main() {
  await connectDB();
  const Category = require('mongoose').model('Category');
  const Product = require('mongoose').model('Product');
  const Brand = require('mongoose').model('Brand');

  const categories = await Category.find({});
  const bagCategoryIds = categories
    .filter(c => c.name?.en?.toLowerCase().includes('bag') || c.name?.en?.toLowerCase().includes('backpack') || c.name?.en?.toLowerCase().includes('wallet'))
    .map(c => c._id.toString());
  
  console.log('Bag category IDs:', bagCategoryIds);

  const products = await Product.find({
    $or: [
      { category: { $in: bagCategoryIds } },
      { parent: { $in: bagCategoryIds } }
    ]
  });

  console.log(`Found ${products.length} products in bag categories.`);
  console.log(JSON.stringify(products.map(p => ({
    id: p._id,
    title: p.title?.en,
    sku: p.sku,
    image: p.image,
    price: p.prices?.price,
    stock: p.stock
  })), null, 2));

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
