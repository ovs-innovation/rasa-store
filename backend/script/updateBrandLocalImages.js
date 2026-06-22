/**
 * updateBrandLocalImages.js
 * Assigns local shoe images to brands (cycling through shoes1-4)
 */

const mongoose = require("mongoose");

const MONGO_URI =
  "mongodb+srv://Rasa:Rasa%40123@therasastore.vg5tubj.mongodb.net/?appName=theRasaStore";

// Assign local shoe images cycling through shoes1-4
const BRAND_IMAGE_MAP = [
  { slug: "nikke",    image: "/shoes1.png" },
  { slug: "adidass",  image: "/shoes2.png" },
  { slug: "jourdann", image: "/shoes3.png" },
  { slug: "balanse",  image: "/shoes4.png" },
  { slug: "konverse", image: "/shoes1.png" },
  { slug: "pumma",    image: "/shoes2.png" },
  { slug: "rebok",    image: "/shoes3.png" },
];

async function run() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("✅ Connected to MongoDB\n");

  const db = mongoose.connection.db;
  const brandsCol = db.collection("brands");

  for (const item of BRAND_IMAGE_MAP) {
    const result = await brandsCol.updateOne(
      { slug: item.slug },
      { $set: { logo: item.image, image: item.image } }
    );
    if (result.matchedCount > 0) {
      console.log(`✅ ${item.slug} → ${item.image}`);
    } else {
      console.log(`⚠️  Not found: ${item.slug}`);
    }
  }

  console.log("\n🎉 Done!");
  await mongoose.disconnect();
}

run().catch((e) => { console.error(e.message); process.exit(1); });
