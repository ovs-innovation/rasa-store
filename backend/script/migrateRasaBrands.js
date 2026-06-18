/**
 * Seeds RASA fashion brands.
 * Usage: node backend/script/migrateRasaBrands.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Brand = require("../models/Brand");

const RASA_BRANDS = [
  { name: { en: "Nike" }, slug: "nike", logo: "/brands/nike.svg" },
  { name: { en: "Adidas" }, slug: "adidas", logo: "/brands/adidas.svg" },
  {
    name: { en: "Onitsuka Tiger" },
    slug: "onitsuka-tiger",
    logo: "/brands/onitsuka-tiger.svg",
  },
  { name: { en: "Puma" }, slug: "puma", logo: "/brands/puma.svg" },
  { name: { en: "Converse" }, slug: "converse", logo: "/brands/converse.svg" },
  {
    name: { en: "New Balance" },
    slug: "new-balance",
    logo: "/brands/new-balance.svg",
  },
  { name: { en: "Vans" }, slug: "vans", logo: "/brands/vans.svg" },
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
