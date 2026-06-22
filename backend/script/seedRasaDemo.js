/**
 * Seeds RASA demo catalog: 6 sneakers, 2 bags, 2 slides.
 * Run after category + brand migrations.
 *
 * Usage: node backend/script/seedRasaDemo.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Product = require("../models/Product");
const Category = require("../models/Category");
const Brand = require("../models/Brand");
const Setting = require("../models/Setting");

const SNEAKER_IMG =
  "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=800&auto=format&fit=crop";
const BAG_IMG =
  "https://images.unsplash.com/photo-1584917865442-de89df76afd3?q=80&w=800&auto=format&fit=crop";
const SLIDE_IMG =
  "https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?q=80&w=800&auto=format&fit=crop";

const DEMO_PRODUCTS = [
  {
    slug: "premium-sports-air-max-90-essential",
    title: "Premium Sports Air Max 90 Essential",
    brandSlug: "premium-sports",
    categorySlug: "footwear",
    gender: "Unisex",
    image: SNEAKER_IMG,
    originalPrice: 12999,
    price: 10999,
    discount: 2000,
    stock: 48,
    sales: 142,
    sku: "RASA-PREM-001",
    tag: ["new-arrival", "trending", "featured"],
  },
  {
    slug: "urban-sports-ultraboost-light",
    title: "Urban Sports Ultraboost Light",
    brandSlug: "urban-sports",
    categorySlug: "footwear",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop",
    originalPrice: 15999,
    price: 13999,
    discount: 2000,
    stock: 36,
    sales: 98,
    sku: "RASA-URB-001",
    tag: ["new-arrival", "trending"],
  },
  {
    slug: "premium-sports-retro-high-1",
    title: "Premium Sports Retro High 1",
    brandSlug: "premium-sports",
    categorySlug: "footwear",
    gender: "Men",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    originalPrice: 18999,
    price: 16999,
    discount: 2000,
    stock: 24,
    sales: 210,
    sku: "RASA-PREM-002",
    tag: ["trending", "featured"],
  },
  {
    slug: "p-brand-rs-x-reinvention",
    title: "P Brand RS-X Reinvention",
    brandSlug: "p-brand",
    categorySlug: "footwear",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    originalPrice: 9999,
    price: 8499,
    discount: 1500,
    stock: 55,
    sales: 76,
    sku: "RASA-PB-001",
    tag: ["new-arrival"],
  },
  {
    slug: "balance-series-550-white-green",
    title: "Balance Series 550 White Green",
    brandSlug: "balance-series",
    categorySlug: "footwear",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800&auto=format&fit=crop",
    originalPrice: 11999,
    price: 9999,
    discount: 2000,
    stock: 40,
    sales: 88,
    sku: "RASA-BAL-001",
    tag: ["new-arrival", "trending"],
  },
  {
    slug: "canvas-series-chuck-70-high",
    title: "Canvas Series Chuck 70 High",
    brandSlug: "canvas-series",
    categorySlug: "footwear",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe37d?q=80&w=800&auto=format&fit=crop",
    originalPrice: 7499,
    price: 6499,
    discount: 1000,
    stock: 60,
    sales: 65,
    sku: "RASA-CANV-001",
    tag: ["new-arrival"],
  },
  {
    slug: "premium-sports-heritage-crossbody-bag",
    title: "Premium Sports Heritage Crossbody Bag",
    brandSlug: "premium-sports",
    categorySlug: "bags",
    gender: "Unisex",
    image: BAG_IMG,
    originalPrice: 3499,
    price: 2999,
    discount: 500,
    stock: 80,
    sales: 45,
    sku: "RASA-PREM-BAG-001",
    tag: ["new-arrival", "featured"],
  },
  {
    slug: "urban-sports-classic-backpack",
    title: "Urban Sports Classic Backpack",
    brandSlug: "urban-sports",
    categorySlug: "bags",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
    originalPrice: 4499,
    price: 3799,
    discount: 700,
    stock: 42,
    sales: 33,
    sku: "RASA-URB-BAG-001",
    tag: ["trending"],
  },
  {
    slug: "premium-sports-benassi-slides",
    title: "Premium Sports Benassi Slides",
    brandSlug: "premium-sports",
    categorySlug: "slides",
    gender: "Unisex",
    image: SNEAKER_IMG,
    originalPrice: 2999,
    price: 2499,
    discount: 500,
    stock: 100,
    sales: 55,
    sku: "RASA-PREM-SLD-001",
    tag: ["new-arrival"],
  },
  {
    slug: "urban-sports-adilette-aqua",
    title: "Urban Sports Adilette Aqua",
    brandSlug: "urban-sports",
    categorySlug: "slides",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1605348532760-67531225b2b7?q=80&w=800&auto=format&fit=crop",
    originalPrice: 2799,
    price: 2299,
    discount: 500,
    stock: 90,
    sales: 41,
    sku: "RASA-URB-SLD-001",
    tag: ["trending"],
  },
];

const run = async () => {
  await connectDB();

  const root = await Category.findOne({ "name.en": "Home" });
  if (!root) {
    console.error("Root category missing. Run: node backend/script/migrateRasaCategories.js");
    process.exit(1);
  }

  const brandMap = {};
  for (const brand of await Brand.find({ status: "show" })) {
    brandMap[brand.slug] = brand;
  }

  const categoryBySlug = {};
  for (const cat of await Category.find({ status: "show" })) {
    if (cat.slug) categoryBySlug[cat.slug] = cat;
  }

  const createdIds = [];
  const newArrivalIds = [];
  const trendingIds = [];

  for (const item of DEMO_PRODUCTS) {
    const brand = brandMap[item.brandSlug];
    const category = categoryBySlug[item.categorySlug];
    if (!brand) {
      console.warn(`  skip ${item.slug}: brand "${item.brandSlug}" not found`);
      continue;
    }
    if (!category) {
      console.warn(`  skip ${item.slug}: category "${item.categorySlug}" not found`);
      continue;
    }

    const payload = {
      title: { en: item.title },
      description: {
        en: `${item.title} — authenticated RASA drop. Premium quality, fast delivery.`,
      },
      slug: item.slug,
      category: category._id,
      categories: [root._id, category._id],
      brand: brand._id,
      gender: item.gender,
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

  // Wire homepage manager defaults with seeded product IDs
  const settingData = require("../utils/settings");
  let settingDoc = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (!settingDoc) {
    const defaults = settingData.find((s) => s.name === "storeCustomizationSetting");
    settingDoc = await Setting.create({
      name: "storeCustomizationSetting",
      setting: defaults?.setting || {},
    });
    console.log("Created storeCustomizationSetting document.");
  }

  const hp = settingDoc.setting?.rasaHomepage || {};
  settingDoc.setting = {
    ...settingDoc.setting,
    rasaHomepage: {
      heroSlides: hp.heroSlides?.length
        ? hp.heroSlides
        : [{ title: "RASA", subtitle: "Premium Sneakers & Streetwear", image: "/shoes1.png", link: "/search" }],
      instagramPosts: hp.instagramPosts?.length
        ? hp.instagramPosts
        : [
            { url: "https://www.instagram.com/kicksbyrasaa", image: SNEAKER_IMG },
            { url: "https://www.instagram.com/kicksbyrasaa", image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=400&auto=format&fit=crop" },
            { url: "https://www.instagram.com/kicksbyrasaa", image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=400&auto=format&fit=crop" },
            { url: "https://www.instagram.com/kicksbyrasaa", image: SLIDE_IMG },
            { url: "https://www.instagram.com/kicksbyrasaa", image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=400&auto=format&fit=crop" },
            { url: "https://www.instagram.com/kicksbyrasaa", image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=400&auto=format&fit=crop" },
          ],
      newArrivalProductIds: newArrivalIds.slice(0, 8),
      trendingProductIds: trendingIds.slice(0, 8),
      brandsSectionEnabled: hp.brandsSectionEnabled !== false,
      categoryBanners: hp.categoryBanners?.length
        ? hp.categoryBanners
        : [
            { title: "Sneakers", slug: "footwear", image: SNEAKER_IMG },
            { title: "Bags", slug: "bags", image: BAG_IMG },
            { title: "Slides", slug: "slides", image: SLIDE_IMG },
            { title: "Accessories", slug: "accessories", image: "" },
          ],
    },
  };
  settingDoc.markModified("setting");
  await settingDoc.save();
  console.log("Updated rasaHomepage with demo product IDs.");

  console.log(`Seeded ${createdIds.length} demo products.`);
  await mongoose.connection.close();
  console.log("Done.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
