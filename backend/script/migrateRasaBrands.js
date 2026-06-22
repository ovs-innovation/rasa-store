/**
 * Seeds RASA fashion brands.
 * Usage: node backend/script/migrateRasaBrands.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Brand = require("../models/Brand");

const RASA_BRANDS = [
  { name: { en: "Premium Sports" }, slug: "premium-sports", logo: "/brands/nike.svg" },
  { name: { en: "Urban Sports" }, slug: "urban-sports", logo: "/brands/adidas.svg" },
  {
    name: { en: "Tiger Series" },
    slug: "tiger-series",
    logo: "/brands/onitsuka-tiger.svg",
  },
  { name: { en: "P Brand" }, slug: "p-brand", logo: "/brands/puma.svg" },
  { name: { en: "Canvas Series" }, slug: "canvas-series", logo: "/brands/converse.svg" },
  {
    name: { en: "Balance Series" },
    slug: "balance-series",
    logo: "/brands/new-balance.svg",
  },
  { name: { en: "Street Series" }, slug: "street-series", logo: "/brands/vans.svg" },
];

const run = async () => {
  await connectDB();

  const deleted = await Brand.deleteMany({});
  console.log(`Cleared ${deleted.deletedCount} old brands.`);

  for (const brand of RASA_BRANDS) {
    await Brand.create({
      name: brand.name,
      slug: brand.slug,
      logo: brand.logo || "",
      status: "show",
    });
    console.log(`  + ${brand.name.en}`);
  }

  await mongoose.connection.close();
  console.log("Done.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
