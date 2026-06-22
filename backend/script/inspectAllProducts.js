const { connectDB } = require('../config/db');
const mongoose = require('mongoose');
require('../models/Product');
require('../models/Category');

async function main() {
  await connectDB();
  const Category = mongoose.model('Category');
  const Product = mongoose.model('Product');

  const products = await Product.find({});
  console.log(`Total products: ${products.length}`);
  
  const uniqueCategories = [...new Set(products.map(p => p.category?.toString()))];
  console.log('Unique product categories in DB:', uniqueCategories);

  for (const catId of uniqueCategories) {
    const cat = await Category.findById(catId);
    console.log(`Category ID ${catId}: name = ${cat ? cat.name?.en : 'NOT FOUND IN DB'}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
