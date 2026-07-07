/**
 * Seeds homepage customer reviews into storeCustomizationSetting if missing.
 * Usage: node backend/script/seedHomepageReviews.js
 */
require("../config/env");
const mongoose = require("mongoose");
const { connectDB } = require("../config/db");
const Setting = require("../models/Setting");

const DEFAULT_HOME_REVIEWS = [
  {
    name: "Arjun M.",
    role: "Mumbai",
    item: "Soleste Tote Bag",
    rating: 5,
    comment:
      "Ordered the bag and it arrived in 2 days. Packaging was insane — felt like opening a luxury gift. Quality is 10/10, no complaints at all.",
    date: "June 2025",
    avatar: "",
  },
  {
    name: "Priya S.",
    role: "Delhi",
    item: "Nikke Runner",
    rating: 5,
    comment:
      "The sneakers I got are exactly as shown — clean colourway, perfect fit. Rasa Store has become my go-to for finding pieces that actually match the pictures.",
    date: "May 2025",
    avatar: "",
  },
  {
    name: "Vikram T.",
    role: "Hyderabad",
    item: "Balanse Low-Top",
    rating: 5,
    comment:
      "These guys know their stuff. Every item is curated properly — no random filler products. My sneakers are absolutely fire!",
    date: "May 2025",
    avatar: "",
  },
  {
    name: "Sneha R.",
    role: "Chennai",
    item: "Heritage Shoulder Bag",
    rating: 5,
    comment:
      "Customer service was super responsive. Had a small query about sizing and they replied within minutes. The bag is absolutely gorgeous.",
    date: "April 2025",
    avatar: "",
  },
];

const DEFAULT_REVIEWS_SECTION = {
  enabled: true,
  eyebrow: "Customer Reviews",
  title: "What Our Customers Say",
  subtitle: "Real feedback from shoppers who bought from Rasa Store.",
};

const run = async () => {
  await connectDB();

  let doc = await Setting.findOne({ name: "storeCustomizationSetting" });
  if (!doc) {
    doc = new Setting({
      name: "storeCustomizationSetting",
      setting: {},
    });
  }

  const setting = doc.setting || {};
  const rasaHomepage = setting.rasaHomepage || {};
  const existing = Array.isArray(rasaHomepage.customerReviews)
    ? rasaHomepage.customerReviews.filter((r) => r?.comment?.trim())
    : [];

  const shouldReplaceWithDefaults =
    existing.length === 0 ||
    existing.length < DEFAULT_HOME_REVIEWS.length ||
    existing.every((r) =>
      ["Aarav S.", "Riya P.", "Vikram M."].includes(String(r?.name || "").trim())
    );

  const customerReviews = shouldReplaceWithDefaults
    ? DEFAULT_HOME_REVIEWS
    : existing;

  doc.setting = {
    ...setting,
    rasaHomepage: {
      ...rasaHomepage,
      customerReviews,
      reviewsSection: {
        ...DEFAULT_REVIEWS_SECTION,
        ...(rasaHomepage.reviewsSection || {}),
      },
    },
  };

  doc.markModified("setting");
  await doc.save();

  console.log(
    `Homepage reviews saved: ${customerReviews.length} review(s) in database.`
  );

  await mongoose.connection.close();
  console.log("Done.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
