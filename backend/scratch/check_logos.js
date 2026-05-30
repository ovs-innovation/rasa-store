require('../config/env');
const mongoose = require('mongoose');
const Brand = require('../models/Brand');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  const brands = await Brand.find({}).limit(15);
  const logos = brands.map(b => b.logo).filter(l => l);
  console.log('Logos in DB:', logos);
  process.exit(0);
}).catch(err => {
  console.error(err);
  process.exit(1);
});
