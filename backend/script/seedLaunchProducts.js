/**
 * Launch catalog — 5 hero sneakers for storefront smoke test.
 * Usage: node backend/script/seedLaunchProducts.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Setting = require("../models/Setting");

const LAUNCH_PRODUCTS = [
  {
    slug: "adidas-samba-og",
    title: "Adidas Samba OG",
    brandSlug: "adidas",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop",
    originalPrice: 9999,
    price: 8499,
    discount: 1500,
    stock: 42,
    sales: 28,
    sku: "RASA-SAMBA-001",
    tag: ["new-arrival", "trending", "featured"],
  },
  {
    slug: "nike-air-force-1",
    title: "Nike Air Force 1",
    brandSlug: "nike",
    image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop",
    originalPrice: 10999,
    price: 9499,
    discount: 1500,
    stock: 55,
    sales: 120,
    sku: "RASA-AF1-001",
    tag: ["trending", "featured"],
  },
  {
    slug: "puma-suede-classic",
    title: "Puma Suede Classic",
    brandSlug: "puma",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    originalPrice: 7999,
    price: 6999,
    discount: 1000,
    stock: 38,
    sales: 45,
    sku: "RASA-PUMA-SUE-001",
    tag: ["new-arrival"],
  },
  {
    slug: "converse-chuck-taylor",
    title: "Converse Chuck Taylor",
    brandSlug: "converse",
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe37d?q=80&w=800&auto=format&fit=crop",
    originalPrice: 6499,
    price: 5499,
    discount: 1000,
    stock: 60,
    sales: 72,
    sku: "RASA-CHUCK-001",
    tag: ["new-arrival", "trending"],
  },
  {
    slug: "new-balance-550",
    title: "New Balance 550",
    brandSlug: "new-balance",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800&auto=format&fit=crop",
    originalPrice: 11999,
    price: 9999,
    discount: 2000,
    stock: 34,
    sales: 88,
    sku: "RASA-NB550-001",
    tag: ["trending", "featured"],
  },
];

const run = async () => {
  await connectDB();

  const root = await Category.findOne({ "name.en": "Home" });
  const footwear = await Category.findOne({ slug: "footwear" });
  if (!root || !footwear) {
    console.error("Categories missing. Run: node backend/script/migrateRasaCategories.js");
    process.exit(1);
  }

  const brandMap = {};
  for (const brand of await Brand.find({ status: "show" })) {
    brandMap[brand.slug] = brand;
  }

  const createdIds = [];
  const newArrivalIds = [];
  const trendingIds = [];

  for (const item of LAUNCH_PRODUCTS) {
    const brand = brandMap[item.brandSlug];
    if (!brand) {
      console.warn(`  skip ${item.slug}: brand "${item.brandSlug}" not found`);
      continue;
    }

    const payload = {
      title: { en: item.title },
      description: {
        en: `${item.title} — premium RASA drop. Authentic style, fast delivery across India.`,
      },
      slug: item.slug,
      category: footwear._id,
      categories: [root._id, footwear._id],
      brand: brand._id,
      gender: "Unisex",
      productType: "Sneakers",
      image: [item.image],
      stock: item.stock,
      sales: item.sales,
      sku: item.sku,
      tag: item.tag,
      prices: {
        originalPrice: item.originalPrice,
        price: item.price,
        discount: item.discount,
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
      product = await Product.findByIdAndUpdate(existing._id, payload, {
        new: true,
        runValidators: false,
      });
      console.log(`  ~ updated: ${item.title}`);
    } else {
      product = await Product.create([payload], { validateBeforeSave: false }).then((d) => d[0]);
      console.log(`  + created: ${item.title}`);
    }

    createdIds.push(String(product._id));
    if (item.tag.includes("new-arrival")) newArrivalIds.push(String(product._id));
    if (item.tag.includes("trending")) trendingIds.push(String(product._id));
  }

  let settingDoc = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (settingDoc) {
    const hp = settingDoc.setting?.rasaHomepage || {};
    settingDoc.setting = {
      ...settingDoc.setting,
      rasaHomepage: {
        ...hp,
        newArrivalProductIds: newArrivalIds,
        trendingProductIds: trendingIds,
      },
    };
    settingDoc.markModified("setting");
    await settingDoc.save();
    console.log("Homepage wired with launch product IDs.");
  }

  console.log(`\nDone — ${createdIds.length}/5 launch products ready.`);
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
