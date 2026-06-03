/**
 * Removes broken legacy Cloudinary URLs from DB (stops 401 errors in admin).
 * Does NOT migrate files — re-upload images in admin after running this.
 *
 * Usage: node script/stripLegacyCloudinaryUrls.js
 */
require("../config/env");
const mongoose = require("mongoose");
const PushNotification = require("../models/PushNotification");
const Setting = require("../models/Setting");
const Customer = require("../models/Customer");
const Product = require("../models/Product");

const LEGACY = ["dhqcwkpzp", "ahossain"];

const isLegacyUrl = (value) => {
  if (typeof value !== "string") return false;
  const lower = value.toLowerCase();
  return LEGACY.some((c) => lower.includes(`res.cloudinary.com/${c}/`));
};

const scrubObject = (obj, path = "") => {
  let count = 0;
  if (!obj || typeof obj !== "object") return count;

  if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      count += scrubObject(item, `${path}[${i}]`);
    });
    return count;
  }

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const keyPath = path ? `${path}.${key}` : key;

    if (typeof val === "string" && isLegacyUrl(val)) {
      obj[key] = "";
      count += 1;
      console.log(`  cleared: ${keyPath}`);
    } else if (val && typeof val === "object") {
      count += scrubObject(val, keyPath);
    }
  }
  return count;
};

async function main() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI missing");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB\n");

  let total = 0;

  const notifs = await PushNotification.find({
    image: { $regex: /res\.cloudinary\.com\/(dhqcwkpzp|ahossain)\//i },
  });
  for (const n of notifs) {
    n.image = "";
    await n.save();
    total += 1;
    console.log(`PushNotification ${n._id}: cleared image`);
  }

  const customers = await Customer.find({
    $or: [
      { image: { $regex: /res\.cloudinary\.com\/(dhqcwkpzp|ahossain)\//i } },
      { "documents.pan": { $regex: /res\.cloudinary\.com\/(dhqcwkpzp|ahossain)\//i } },
      { "documents.gst": { $regex: /res\.cloudinary\.com\/(dhqcwkpzp|ahossain)\//i } },
    ],
  });
  for (const c of customers) {
    if (isLegacyUrl(c.image)) {
      c.image = "";
      total += 1;
      console.log(`Customer ${c._id}: cleared image`);
    }
    if (c.documents && typeof c.documents === "object") {
      for (const key of Object.keys(c.documents)) {
        if (isLegacyUrl(c.documents[key])) {
          c.documents[key] = "";
          total += 1;
          console.log(`Customer ${c._id}: cleared documents.${key}`);
        }
      }
    }
    await c.save();
  }

  const products = await Product.find({
    image: { $regex: /res\.cloudinary\.com\/(dhqcwkpzp|ahossain)\//i },
  });
  for (const p of products) {
    p.image = (p.image || []).map((url) => (isLegacyUrl(url) ? "" : url)).filter(Boolean);
    await p.save();
    total += 1;
    console.log(`Product ${p._id}: cleared legacy image(s)`);
  }

  const settings = await Setting.find({});
  for (const doc of settings) {
    const before = total;
    if (doc.setting) total += scrubObject(doc.setting, doc.name);
    if (doc.storeCustomizationSetting) {
      total += scrubObject(doc.storeCustomizationSetting, `${doc.name}.store`);
    }
    if (total > before) {
      await doc.save();
      console.log(`Setting "${doc.name}" updated`);
    }
  }

  console.log(`\nDone. Cleared ${total} legacy URL field(s).`);
  console.log("Re-upload logo & banners in Admin → Settings / Store Customization.");
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
