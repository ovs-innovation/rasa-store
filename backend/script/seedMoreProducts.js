/**
 * Add more RASA store products (non-destructive upsert by slug).
 * Usage: node backend/script/seedMoreProducts.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Setting = require("../models/Setting");

const IMG = {
  sneaker1: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
  sneaker2: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop",
  sneaker3: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
  sneaker4: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
  sneaker5: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800&auto=format&fit=crop",
  sneaker6: "https://images.unsplash.com/photo-1607522370275-f14206abe37d?q=80&w=800&auto=format&fit=crop",
  bag1: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop",
  bag2: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
  slide1: "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop",
  rasa: "https://res.cloudinary.com/dsazjohhf/image/upload/v1781778846/rasa/TrendingFootwear-CuteNikeShoesforAll.jpg",
};

const MORE_PRODUCTS = [
  { slug: "street-runner-pro", title: "Street Runner Pro", type: "Sneakers", gender: "Unisex", image: IMG.sneaker1, originalPrice: 4999, price: 4499, stock: 32, sales: 18, tag: ["new-arrival", "trending"] },
  { slug: "classic-court-low", title: "Classic Court Low", type: "Sneakers", gender: "Men", image: IMG.sneaker3, originalPrice: 5999, price: 5299, stock: 28, sales: 24, tag: ["trending"] },
  { slug: "retro-high-top", title: "Retro High Top", type: "Sneakers", gender: "Unisex", image: IMG.sneaker4, originalPrice: 6999, price: 5999, stock: 20, sales: 31, tag: ["new-arrival", "featured"] },
  { slug: "urban-knit-runner", title: "Urban Knit Runner", type: "Sneakers", gender: "Women", image: IMG.sneaker2, originalPrice: 5499, price: 4799, stock: 35, sales: 15, tag: ["new-arrival"] },
  { slug: "balance-550-edition", title: "Balance 550 Edition", type: "Sneakers", gender: "Unisex", image: IMG.sneaker5, originalPrice: 7999, price: 6999, stock: 18, sales: 42, tag: ["trending", "featured"] },
  { slug: "canvas-high-street", title: "Canvas High Street", type: "Sneakers", gender: "Unisex", image: IMG.sneaker6, originalPrice: 3999, price: 3499, stock: 45, sales: 12, tag: ["new-arrival"] },
  { slug: "premium-dunk-low", title: "Premium Dunk Low", type: "Sneakers", gender: "Men", image: IMG.rasa, originalPrice: 8999, price: 7999, stock: 15, sales: 55, tag: ["trending"] },
  { slug: "heritage-crossbody", title: "Heritage Crossbody Bag", type: "Bags", gender: "Unisex", image: IMG.bag1, originalPrice: 2999, price: 2499, stock: 50, sales: 9, tag: ["new-arrival"] },
  { slug: "urban-daypack", title: "Urban Daypack", type: "Bags", gender: "Unisex", image: IMG.bag2, originalPrice: 4499, price: 3799, stock: 30, sales: 14, tag: ["trending"] },
  { slug: "minimal-tote", title: "Minimal Tote Bag", type: "Bags", gender: "Women", image: IMG.bag1, originalPrice: 3499, price: 2999, stock: 40, sales: 8, tag: ["new-arrival"] },
  { slug: "comfort-slide", title: "Comfort Slide", type: "Slides", gender: "Unisex", image: IMG.slide1, originalPrice: 1999, price: 1699, stock: 60, sales: 22, tag: ["new-arrival"] },
  { slug: "sport-pool-slide", title: "Sport Pool Slide", type: "Slides", gender: "Unisex", image: IMG.slide1, originalPrice: 2299, price: 1899, stock: 55, sales: 17, tag: ["trending"] },
];

async function ensureCategory({ name, slug, parentId = null, parentName = null }) {
  let cat = await Category.findOne({ slug });
  if (cat) return cat;
  cat = await Category.findOne({ "name.en": name });
  if (cat) {
    if (!cat.slug) {
      cat.slug = slug;
      await cat.save();
    }
    return cat;
  }
  return Category.create({
    name: { en: name, default: name },
    slug,
    parentId,
    parentName,
    status: "show",
    featured: true,
    priority: "High",
  });
}

async function ensureRoot() {
  let root = await Category.findOne({ "name.en": "Home" });
  if (!root) {
    root = await Category.create({
      name: { en: "Home", default: "Home" },
      slug: "home",
      status: "show",
    });
  }
  return root;
}

const run = async () => {
  await connectDB();

  const root = await ensureRoot();
  const shoesCat = await ensureCategory({
    name: "Shoes",
    slug: "footwear",
    parentId: root._id,
    parentName: "Home",
  });
  const bagsCat = await ensureCategory({
    name: "Bags",
    slug: "bags",
    parentId: root._id,
    parentName: "Home",
  });

  const brands = await Brand.find({ status: "show" });
  if (!brands.length) {
    console.error("No brands found. Add at least one brand in admin first.");
    process.exit(1);
  }

  const pickBrand = (i) => brands[i % brands.length];

  const createdIds = [];
  const newArrivalIds = [];
  const trendingIds = [];

  for (let i = 0; i < MORE_PRODUCTS.length; i++) {
    const item = MORE_PRODUCTS[i];
    const brand = pickBrand(i);
    const category =
      item.type === "Bags" ? bagsCat : shoesCat;

    const payload = {
      title: { en: item.title },
      description: { en: `${item.title} — premium quality from Rasa Store.` },
      slug: item.slug,
      category: category._id,
      categories: [root._id, category._id],
      brand: brand._id,
      gender: item.gender,
      productType: item.type,
      image: [item.image],
      stock: item.stock,
      sales: item.sales,
      sku: `RASA-${item.slug.toUpperCase().replace(/-/g, "").slice(0, 12)}`,
      tag: item.tag,
      prices: {
        originalPrice: item.originalPrice,
        price: item.price,
        discount: Math.max(0, item.originalPrice - item.price),
      },
      isCombination: false,
      variants: [],
      status: "show",
      taxRate: 0,
      isPriceInclusive: false,
    };

    const existing = await Product.findOne({ slug: item.slug });
    let product;
    if (existing) {
      product = await Product.findByIdAndUpdate(existing._id, payload, { new: true });
      console.log(`  ~ updated: ${item.title}`);
    } else {
      product = await Product.create(payload);
      console.log(`  + created: ${item.title}`);
    }

    createdIds.push(String(product._id));
    if (item.tag.includes("new-arrival")) newArrivalIds.push(String(product._id));
    if (item.tag.includes("trending")) trendingIds.push(String(product._id));
  }

  // Include existing sneaker in homepage lists
  const sneaker = await Product.findOne({ slug: "sneaker" });
  if (sneaker) {
    createdIds.unshift(String(sneaker._id));
    newArrivalIds.unshift(String(sneaker._id));
    trendingIds.unshift(String(sneaker._id));
  }

  const settingDoc = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (settingDoc) {
    const hp = settingDoc.setting?.rasaHomepage || {};
    settingDoc.setting = {
      ...settingDoc.setting,
      rasaHomepage: {
        ...hp,
        newArrivalProductIds: [...new Set(newArrivalIds)].slice(0, 12),
        trendingProductIds: [...new Set(trendingIds)].slice(0, 12),
        categoryBanners: hp.categoryBanners?.length
          ? hp.categoryBanners
          : [
              { title: "Shoes", slug: "footwear", image: IMG.sneaker1 },
              { title: "Bags", slug: "bags", image: IMG.bag1 },
            ],
      },
    };
    settingDoc.markModified("setting");
    await settingDoc.save();
    console.log("Updated homepage product IDs.");
  }

  const total = await Product.countDocuments({ status: "show" });
  console.log(`Done. ${MORE_PRODUCTS.length} products upserted. Total live products: ${total}`);
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
