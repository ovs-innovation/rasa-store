/**
 * Set real brand logo URLs on existing brands.
 * Run: node backend/script/updateBrandLogos.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Brand = require("../models/Brand");

const LOGOS = {
  nike: "/brands/nike.svg",
  adidas: "/brands/adidas.svg",
  puma: "/brands/puma.svg",
  converse: "/brands/converse.svg",
  "new-balance": "/brands/new-balance.svg",
  vans: "/brands/vans.svg",
  "onitsuka-tiger": "/brands/onitsuka-tiger.svg",
};

const run = async () => {
  await connectDB();
  let updated = 0;
  for (const [slug, logo] of Object.entries(LOGOS)) {
    const res = await Brand.updateOne({ slug }, { $set: { logo } });
    const matched = res.matchedCount ?? res.n ?? 0;
    if (matched) {
      updated += 1;
      console.log(`  ✓ ${slug}`);
    } else {
      console.log(`  - skip ${slug} (not in DB)`);
    }
  }
  console.log(`\nUpdated ${updated} brand logo(s).`);
  await mongoose.connection.close();
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
