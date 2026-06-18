require('dotenv').config({ path: __dirname + '/.env' });
const mongoose = require('mongoose');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const Category = require('./models/Category');
  const Brand = require('./models/Brand');
  const Product = require('./models/Product');

  const cats = await Category.find({}, 'name slug parentId parentName status').lean();
  const brands = await Brand.find({}, 'name slug status').lean();
  const productCount = await Product.countDocuments();
  const sampleProduct = await Product.findOne({}, 'title featuredImage hoverImage image seoImage categories category brand status').lean();

  console.log('\n=== CATEGORIES (' + cats.length + ') ===');
  cats.forEach(c => {
    const name = c.name?.en || c.name?.value || JSON.stringify(c.name);
    const parent = c.parentId ? `  [child of ${c.parentName || c.parentId}]` : '[ROOT]';
    console.log(`  ${parent} ${name} | slug: ${c.slug} | status: ${c.status}`);
  });

  console.log('\n=== BRANDS (' + brands.length + ') ===');
  brands.forEach(b => {
    const name = b.name?.en || b.name?.value || JSON.stringify(b.name);
    console.log(`  ${name} | slug: ${b.slug} | status: ${b.status}`);
  });

  console.log('\n=== PRODUCTS ===');
  console.log('Total count:', productCount);
  if (sampleProduct) {
    console.log('Sample product fields:');
    console.log('  title:', JSON.stringify(sampleProduct.title));
    console.log('  featuredImage:', sampleProduct.featuredImage || '(empty)');
    console.log('  hoverImage:', sampleProduct.hoverImage || '(empty)');
    console.log('  image count:', Array.isArray(sampleProduct.image) ? sampleProduct.image.length : 'N/A');
    console.log('  seoImage:', sampleProduct.seoImage || '(empty)');
    console.log('  category:', sampleProduct.category);
    console.log('  status:', sampleProduct.status);
  }

  process.exit(0);
}).catch(e => { console.error('DB error:', e.message); process.exit(1); });
