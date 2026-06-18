const mongoose = require('mongoose');
require('dotenv').config({ path: '../backend/.env' });

const ProductSchema = new mongoose.Schema({
  title: Object,
  category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category' },
  categories: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Category' }],
  status: String,
});

const CategorySchema = new mongoose.Schema({
  name: Object,
  parent: String,
  children: Array,
});

async function check() {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/rasa_store');
    console.log('Connected to DB');

    const Product = mongoose.model('Product', ProductSchema);
    const Category = mongoose.model('Category', CategorySchema);

    const products = await Product.find({ status: 'show' })
      .populate('category', 'name')
      .populate('categories', 'name');

    console.log(`Total active products: ${products.length}`);
    
    products.forEach(p => {
      const catName = p.category?.name?.en || p.category?.name || 'No Category';
      const multiCats = p.categories?.map(c => c.name?.en || c.name).join(', ') || 'No Multi-Categories';
      console.log(`Product: ${p.title?.en || p.title} | Main Cat: ${catName} | All Cats: ${multiCats}`);
    });

    const categories = await Category.find({});
    console.log('\nCategories in DB:');
    categories.forEach(c => {
      console.log(`ID: ${c._id} | Name: ${c.name?.en || c.name}`);
    });

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

check();
