const { connectDB } = require('../config/db');
const mongoose = require('mongoose');
const Brand = require('../models/Brand');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Setting = require('../models/Setting');

const BRAND_MAPPING = {
  // Existing rebranded slugs
  "premium-sports": { name: "Aero", newSlug: "aero", logo: "/brands/aero.svg" },
  "urban-sports": { name: "Soleste", newSlug: "soleste", logo: "/brands/soleste.svg" },
  "p-brand": { name: "Pinnacle", newSlug: "pinnacle", logo: "/brands/pinnacle.svg" },
  "street-series": { name: "Vanguard", newSlug: "vanguard", logo: "/brands/vanguard.svg" },
  "canvas-series": { name: "Heritage", newSlug: "heritage", logo: "/brands/heritage.svg" },
  "balance-series": { name: "Equinox", newSlug: "equinox", logo: "/brands/equinox.svg" },
  "tiger-series": { name: "Kurashiki", newSlug: "kurashiki", logo: "/brands/kurashiki.svg" },
  
  // Legacy / original slugs (in case any exist)
  "nike": { name: "Aero", newSlug: "aero", logo: "/brands/aero.svg" },
  "adidas": { name: "Soleste", newSlug: "soleste", logo: "/brands/soleste.svg" },
  "puma": { name: "Pinnacle", newSlug: "pinnacle", logo: "/brands/pinnacle.svg" },
  "vans": { name: "Vanguard", newSlug: "vanguard", logo: "/brands/vanguard.svg" },
  "converse": { name: "Heritage", newSlug: "heritage", logo: "/brands/heritage.svg" },
  "new-balance": { name: "Equinox", newSlug: "equinox", logo: "/brands/equinox.svg" },
  "onitsuka-tiger": { name: "Kurashiki", newSlug: "kurashiki", logo: "/brands/kurashiki.svg" },
  "jordan": { name: "Aero", newSlug: "aero", logo: "/brands/aero.svg" }
};

// Text replacements for trademark cleanup
const TEXT_REPLACEMENTS = [
  // Original Trademarks
  [/Nike/g, "Aero"],
  [/nike/g, "aero"],
  [/Adidas/g, "Soleste"],
  [/adidas/g, "soleste"],
  [/Puma/g, "Pinnacle"],
  [/puma/g, "pinnacle"],
  [/Vans/g, "Vanguard"],
  [/vans/g, "vanguard"],
  [/Converse/g, "Heritage"],
  [/converse/g, "heritage"],
  [/New Balance/g, "Equinox"],
  [/new balance/g, "equinox"],
  [/Onitsuka Tiger/g, "Kurashiki"],
  [/onitsuka tiger/g, "kurashiki"],
  [/Jordan/g, "Aero"],
  [/jordan/g, "aero"],

  // Generic Rebranded Names
  [/Premium Sports/g, "Aero"],
  [/premium sports/g, "aero"],
  [/Urban Sports/g, "Soleste"],
  [/urban sports/g, "soleste"],
  [/P Brand/g, "Pinnacle"],
  [/p brand/g, "pinnacle"],
  [/Street Series/g, "Vanguard"],
  [/street series/g, "vanguard"],
  [/Canvas Series/g, "Heritage"],
  [/canvas series/g, "heritage"],
  [/Balance Series/g, "Equinox"],
  [/balance series/g, "equinox"],
  [/Tiger Series/g, "Kurashiki"],
  [/tiger series/g, "kurashiki"],
  [/J-Series/g, "Aero"],
  [/j-series/g, "aero"]
];

// Mapping for invalid category IDs pointing to valid active categories
const CATEGORY_MAPPING = {
  "6a3193b8d7f59b4498e25551": "6a33872af6601848fc56574b", // Footwear
  "6a3193b8d7f59b4498e25552": "6a33872af6601848fc56574c", // Bags
  "6a3193b8d7f59b4498e25553": "6a33872af6601848fc565750"  // Slides & Slippers
};

const cleanString = (str) => {
  if (!str || typeof str !== "string") return str;
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

async function run() {
  await connectDB();

  console.log("1. Rebranding and validating Brand collection...");
  const brands = await Brand.find({});
  const brandIdMap = {};

  for (const brand of brands) {
    const slug = brand.slug.toLowerCase().trim();
    const mapping = BRAND_MAPPING[slug];
    if (mapping) {
      console.log(`  Rebranding brand: ${brand.name.en || slug} -> ${mapping.name}`);
      brand.name = { en: mapping.name };
      brand.slug = mapping.newSlug;
      brand.logo = mapping.logo;
      brand.markModified("name");
      await brand.save();
    } else {
      const cleanName = cleanString(brand.name.en || brand.name);
      const cleanSlug = cleanString(brand.slug);
      if (cleanName !== brand.name.en || cleanSlug !== brand.slug) {
        console.log(`  Cleaning partial brand name/slug: ${brand.name.en} -> ${cleanName}`);
        brand.name = { en: cleanName };
        brand.slug = cleanSlug;
        brand.markModified("name");
        await brand.save();
      }
    }
    brandIdMap[brand._id.toString()] = brand;
  }

  // Ensure all luxury brands exist in DB
  const luxurySlugs = ["aero", "soleste", "pinnacle", "vanguard", "heritage", "equinox", "kurashiki"];
  const luxuryNames = {
    "aero": "Aero",
    "soleste": "Soleste",
    "pinnacle": "Pinnacle",
    "vanguard": "Vanguard",
    "heritage": "Heritage",
    "equinox": "Equinox",
    "kurashiki": "Kurashiki"
  };

  for (const slug of luxurySlugs) {
    const exists = await Brand.findOne({ slug });
    if (!exists) {
      const created = await Brand.create({
        name: { en: luxuryNames[slug] },
        slug: slug,
        logo: `/brands/${slug}.svg`,
        status: "show"
      });
      console.log(`  + Created missing brand: ${luxuryNames[slug]}`);
      brandIdMap[created._id.toString()] = created;
    }
  }

  // Delete any brand that has a slug not in the luxury list to keep it clean
  const allBrandsAfter = await Brand.find({});
  for (const brand of allBrandsAfter) {
    if (!luxurySlugs.includes(brand.slug)) {
      console.log(`  - Deleting legacy/extra brand: ${brand.slug}`);
      await Brand.deleteOne({ _id: brand._id });
    }
  }

  // Fetch updated brands map
  const finalBrands = await Brand.find({});
  const finalBrandMapBySlug = {};
  finalBrands.forEach(b => {
    finalBrandMapBySlug[b.slug] = b._id;
  });

  console.log("2. Auditing and updating Product collection...");
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
      let newSlug = cleanString(oldSlug);
      if (oldSlug !== newSlug) {
        product.slug = newSlug;
        changed = true;
      }
    }

    // Check category references
    const currentCatId = product.category?.toString();
    if (CATEGORY_MAPPING[currentCatId]) {
      const newCatId = CATEGORY_MAPPING[currentCatId];
      console.log(`  Updating product category for "${product.title?.en}": ${currentCatId} -> ${newCatId}`);
      product.category = mongoose.Types.ObjectId(newCatId);
      changed = true;
    }

    // Map parent categories as well
    if (product.parent) {
      const cleanParent = cleanString(product.parent);
      if (product.parent !== cleanParent) {
        product.parent = cleanParent;
        changed = true;
      }
    }

    // Check brand reference map
    // We should make sure the product's brand ID matches the current brand's ID in the DB
    // First, let's identify the correct brand slug for this product based on its title
    let targetBrandSlug = "";
    const titleLower = (product.title?.en || "").toLowerCase();
    if (titleLower.includes("aero")) targetBrandSlug = "aero";
    else if (titleLower.includes("soleste")) targetBrandSlug = "soleste";
    else if (titleLower.includes("pinnacle")) targetBrandSlug = "pinnacle";
    else if (titleLower.includes("vanguard")) targetBrandSlug = "vanguard";
    else if (titleLower.includes("heritage")) targetBrandSlug = "heritage";
    else if (titleLower.includes("equinox")) targetBrandSlug = "equinox";
    else if (titleLower.includes("kurashiki")) targetBrandSlug = "kurashiki";

    if (targetBrandSlug && finalBrandMapBySlug[targetBrandSlug]) {
      const expectedBrandId = finalBrandMapBySlug[targetBrandSlug].toString();
      if (!product.brand || product.brand.toString() !== expectedBrandId) {
        console.log(`  Updating brand reference for "${product.title?.en}": -> ${targetBrandSlug}`);
        product.brand = mongoose.Types.ObjectId(expectedBrandId);
        changed = true;
      }
    }

    if (changed) {
      await product.save();
      updatedProductsCount++;
    }
  }
  console.log(`  Audited and updated ${updatedProductsCount} products.`);

  console.log("3. Scrubbing storeCustomizationSetting & globalSetting...");
  const settings = await Setting.find({});
  let updatedSettingsCount = 0;
  for (const doc of settings) {
    const cleaned = cleanObject(doc.setting);
    if (JSON.stringify(doc.setting) !== JSON.stringify(cleaned)) {
      doc.setting = cleaned;
      doc.markModified("setting");
      await doc.save();
      updatedSettingsCount++;
      console.log(`  Updated settings document: ${doc.name}`);
    }
  }
  console.log(`  Scrubbed ${updatedSettingsCount} settings docs.`);

  await mongoose.connection.close();
  console.log("Database Rebranding and Audit Completed successfully!");
}

run().catch(err => {
  console.error("Migration failed:", err);
  process.exit(1);
});
