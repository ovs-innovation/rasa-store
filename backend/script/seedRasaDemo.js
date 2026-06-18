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
    slug: "nike-air-max-90-essential",
    title: "Nike Air Max 90 Essential",
    brandSlug: "nike",
    categorySlug: "footwear",
    gender: "Unisex",
    image: SNEAKER_IMG,
    originalPrice: 12999,
    price: 10999,
    discount: 2000,
    stock: 48,
    sales: 142,
    sku: "RASA-NKE-001",
    tag: ["new-arrival", "trending", "featured"],
  },
  {
    slug: "adidas-ultraboost-light",
    title: "Adidas Ultraboost Light",
    brandSlug: "adidas",
    categorySlug: "footwear",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1608231387042-66d1773070a5?q=80&w=800&auto=format&fit=crop",
    originalPrice: 15999,
    price: 13999,
    discount: 2000,
    stock: 36,
    sales: 98,
    sku: "RASA-ADI-001",
    tag: ["new-arrival", "trending"],
  },
  {
    slug: "air-jordan-1-retro-high",
    title: "Air Jordan 1 Retro High",
    brandSlug: "jordan",
    categorySlug: "footwear",
    gender: "Men",
    image: "https://images.unsplash.com/photo-1552346154-21d32810aba3?q=80&w=800&auto=format&fit=crop",
    originalPrice: 18999,
    price: 16999,
    discount: 2000,
    stock: 24,
    sales: 210,
    sku: "RASA-JRD-001",
    tag: ["trending", "featured"],
  },
  {
    slug: "puma-rs-x-reinvention",
    title: "Puma RS-X Reinvention",
    brandSlug: "puma",
    categorySlug: "footwear",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=800&auto=format&fit=crop",
    originalPrice: 9999,
    price: 8499,
    discount: 1500,
    stock: 55,
    sales: 76,
    sku: "RASA-PUMA-001",
    tag: ["new-arrival"],
  },
  {
    slug: "new-balance-550-white-green",
    title: "New Balance 550 White Green",
    brandSlug: "new-balance",
    categorySlug: "footwear",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?q=80&w=800&auto=format&fit=crop",
    originalPrice: 11999,
    price: 9999,
    discount: 2000,
    stock: 40,
    sales: 88,
    sku: "RASA-NB-001",
    tag: ["new-arrival", "trending"],
  },
  {
    slug: "converse-chuck-70-high",
    title: "Converse Chuck 70 High",
    brandSlug: "converse",
    categorySlug: "footwear",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1607522370275-f14206abe37d?q=80&w=800&auto=format&fit=crop",
    originalPrice: 7499,
    price: 6499,
    discount: 1000,
    stock: 60,
    sales: 65,
    sku: "RASA-CNV-001",
    tag: ["new-arrival"],
  },
  {
    slug: "nike-heritage-crossbody-bag",
    title: "Nike Heritage Crossbody Bag",
    brandSlug: "nike",
    categorySlug: "bags",
    gender: "Unisex",
    image: BAG_IMG,
    originalPrice: 3499,
    price: 2999,
    discount: 500,
    stock: 80,
    sales: 45,
    sku: "RASA-NKE-BAG-001",
    tag: ["new-arrival", "featured"],
  },
  {
    slug: "adidas-classic-backpack",
    title: "Adidas Classic Backpack",
    brandSlug: "adidas",
    categorySlug: "bags",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?q=80&w=800&auto=format&fit=crop",
    originalPrice: 4499,
    price: 3799,
    discount: 700,
    stock: 42,
    sales: 33,
    sku: "RASA-ADI-BAG-001",
    tag: ["trending"],
  },
  {
    slug: "nike-benassi-slides",
    title: "Nike Benassi Slides",
    brandSlug: "nike",
    categorySlug: "slides",
    gender: "Unisex",
    image: SLIDE_IMG,
    originalPrice: 2999,
    price: 2499,
    discount: 500,
    stock: 100,
    sales: 55,
    sku: "RASA-NKE-SLD-001",
    tag: ["new-arrival"],
  },
  {
    slug: "adidas-adilette-aqua",
    title: "Adidas Adilette Aqua",
    brandSlug: "adidas",
    categorySlug: "slides",
    gender: "Unisex",
    image: "https://images.unsplash.com/photo-1605348532760-67531225b2b7?q=80&w=800&auto=format&fit=crop",
    originalPrice: 2799,
    price: 2299,
    discount: 500,
    stock: 90,
    sales: 41,
    sku: "RASA-ADI-SLD-001",
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
