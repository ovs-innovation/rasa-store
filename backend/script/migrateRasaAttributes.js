/**
 * Seeds RASA fashion color variants (non-destructive).
 * Usage: node backend/script/migrateRasaAttributes.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Attribute = require("../models/Attribute");

const FASHION_COLORS = [
  { name: { en: "Black" }, hexColor: "#000000" },
  { name: { en: "White" }, hexColor: "#FFFFFF" },
  { name: { en: "Blue" }, hexColor: "#2563EB" },
  { name: { en: "Red" }, hexColor: "#DC2626" },
  { name: { en: "Green" }, hexColor: "#16A34A" },
  { name: { en: "Brown" }, hexColor: "#92400E" },
  { name: { en: "Pink" }, hexColor: "#EC4899" },
  { name: { en: "Grey" }, hexColor: "#6B7280" },
];

const UK_SIZES = [
  "UK 3", "UK 4", "UK 5", "UK 6", "UK 7", "UK 8", "UK 9", "UK 10",
];

const upsertAttribute = async (nameEn, payload) => {
  let attr = await Attribute.findOne({ "name.en": nameEn });
  if (!attr) {
    attr = await Attribute.create(payload);
    console.log(`  + created ${nameEn} attribute`);
  } else {
    Object.assign(attr, payload);
    await attr.save();
    console.log(`  ~ updated ${nameEn} attribute`);
  }
  return attr;
};

const run = async () => {
  await connectDB();

  await upsertAttribute("Color", {
    type: "attribute",
    status: "show",
    title: { en: "Color" },
    name: { en: "Color" },
    option: "Dropdown",
    variants: FASHION_COLORS.map((c) => ({
      status: "show",
      name: c.name,
      hexColor: c.hexColor,
    })),
  });

  await upsertAttribute("Size", {
    type: "attribute",
    status: "show",
    title: { en: "Size" },
    name: { en: "Size" },
    option: "Radio",
    variants: UK_SIZES.map((size) => ({
      status: "show",
      name: { en: size },
    })),
  });

  await mongoose.connection.close();
  console.log("Done.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
