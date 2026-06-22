/**
 * Rebrands all current Brands and Products in the MongoDB database.
 * Run: node backend/script/rebrandAllBrands.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Brand = require("../models/Brand");
const Product = require("../models/Product");
const Setting = require("../models/Setting");

const BRAND_MAPPING = {
  "nike": { name: "Premium Sports", newSlug: "premium-sports" },
  "adidas": { name: "Urban Sports", newSlug: "urban-sports" },
  "puma": { name: "P Brand", newSlug: "p-brand" },
  "vans": { name: "Street Series", newSlug: "street-series" },
  "converse": { name: "Canvas Series", newSlug: "canvas-series" },
  "new-balance": { name: "Balance Series", newSlug: "balance-series" },
  "onitsuka-tiger": { name: "Tiger Series", newSlug: "tiger-series" },
  "jordan": { name: "Premium Sports", newSlug: "premium-sports" }
};

const TEXT_REPLACEMENTS = [
  [/Nike/g, "Premium Sports"],
  [/adidas/g, "urban sports"],
  [/Adidas/g, "Urban Sports"],
  [/Puma/g, "P Brand"],
  [/Vans/g, "Street Series"],
  [/Converse/g, "Canvas Series"],
  [/New Balance/g, "Balance Series"],
  [/Onitsuka Tiger/g, "Tiger Series"],
  [/Jordan/g, "J-Series"],
  [/nike/g, "premium-sports"],
  [/puma/g, "p-brand"],
  [/vans/g, "street-series"],
  [/converse/g, "canvas-series"]
];

const cleanString = (str) => {
  if (!str) return str;
  let next = str;
  for (const [pattern, replacement] of TEXT_REPLACEMENTS) {
    next = next.replace(pattern, replacement);
  }
  return next;
};

const cleanObject = (obj) => {
  if (!obj) return obj;
  if (typeof obj === "string") return cleanString(obj);
  if (Array.isArray(obj)) return obj.map(cleanObject);
  if (typeof obj === "object") {
    const next = {};
    for (const [k, v] of Object.entries(obj)) {
      next[k] = cleanObject(v);
    }
    return next;
  }
  return obj;
};

const run = async () => {
  await connectDB();

  console.log("1. Migrating Brand Collection...");
  const oldBrands = await Brand.find({});
  const brandIdMap = {};

  for (const brand of oldBrands) {
    const slug = brand.slug.toLowerCase().trim();
    const mapping = BRAND_MAPPING[slug];
    if (mapping) {
      console.log(`  Rebranding brand: ${brand.name.en || slug} -> ${mapping.name}`);
      brand.name = { en: mapping.name };
      brand.slug = mapping.newSlug;
      brand.markModified("name");
      await brand.save();
      brandIdMap[brand._id.toString()] = brand;
    } else {
      // Clean name/slug if it matched partially
      const cleanName = cleanString(brand.name.en || brand.name);
      const cleanSlug = cleanString(brand.slug);
      if (cleanName !== brand.name.en || cleanSlug !== brand.slug) {
        console.log(`  Cleaning partial brand: ${brand.name.en} -> ${cleanName}`);
        brand.name = { en: cleanName };
        brand.slug = cleanSlug;
        brand.markModified("name");
        await brand.save();
      }
      brandIdMap[brand._id.toString()] = brand;
    }
  }

  // Double check that we have all rebranded brands created
  for (const [key, mapping] of Object.entries(BRAND_MAPPING)) {
    if (key === "jordan") continue; // mapped to premium sports
    const exists = await Brand.findOne({ slug: mapping.newSlug });
    if (!exists) {
      const created = await Brand.create({
        name: { en: mapping.name },
        slug: mapping.newSlug,
        logo: `/brands/${key === "new-balance" ? "new-balance" : key === "onitsuka-tiger" ? "onitsuka-tiger" : key}.svg`,
        status: "show"
      });
      console.log(`  + Created missing rebranded brand: ${mapping.name}`);
      brandIdMap[created._id.toString()] = created;
    }
  }

  console.log("2. Migrating Product Collection...");
  const products = await Product.find({});
  let updatedProductsCount = 0;

  for (const product of products) {
    let changed = false;

    // Check titles
    if (product.title) {
      const oldTitle = product.title.en || "";
      const newTitle = cleanString(oldTitle);
      if (oldTitle !== newTitle) {
        product.title = { en: newTitle };
        product.markModified("title");
        changed = true;
      }
    }

    // Check descriptions
    if (product.description) {
      const oldDesc = product.description.en || "";
      const newDesc = cleanString(oldDesc);
      if (oldDesc !== newDesc) {
        product.description = { en: newDesc };
        product.markModified("description");
        changed = true;
      }
    }

    // Check slugs
    if (product.slug) {
      const oldSlug = product.slug;
      const newSlug = cleanString(oldSlug);
      if (oldSlug !== newSlug) {
        product.slug = newSlug;
        changed = true;
      }
    }

    // Check tags
    if (product.tag && product.tag.length > 0) {
      const newTags = product.tag.map(t => cleanString(t));
      if (JSON.stringify(product.tag) !== JSON.stringify(newTags)) {
        product.tag = newTags;
        product.markModified("tag");
        changed = true;
      }
    }

    // Check brand reference
    if (product.brand) {
      const brandObj = brandIdMap[product.brand.toString()];
      if (brandObj) {
        // Just make sure it points to the updated brand slug
        const checkBrand = await Brand.findById(product.brand);
        if (checkBrand && checkBrand.slug !== brandObj.slug) {
          console.log(`  Updating product brand reference mapping for ${product.title?.en}`);
        }
      }
    }

    if (changed) {
      await product.save();
      updatedProductsCount++;
    }
  }
  console.log(`  Updated ${updatedProductsCount} products.`);

  console.log("3. Scrubbing homepage settings...");
  const settings = await Setting.find({});
  let updatedSettingsCount = 0;
  for (const doc of settings) {
    const cleaned = cleanObject(doc.setting);
    if (JSON.stringify(doc.setting) !== JSON.stringify(cleaned)) {
      doc.setting = cleaned;
      doc.markModified("setting");
      await doc.save();
      updatedSettingsCount++;
      console.log(`  Updated setting doc: ${doc.name}`);
    }
  }
  console.log(`  Updated ${updatedSettingsCount} settings docs.`);

  await mongoose.connection.close();
  console.log("Database Rebranding Done!");
};

run().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
