/**
 * renameBrandsWithShoes.js
 * Renames brands to copyright-safe variations and adds shoe images
 * Run: node script/renameBrandsWithShoes.js
 */

const mongoose = require("mongoose");

const MONGO_URI =
  "mongodb+srv://Rasa:Rasa%40123@therasastore.vg5tubj.mongodb.net/?appName=theRasaStore";

// Copyright-safe brand names + shoe images (Unsplash free images)
// Slug stays the same so existing product links don't break
const BRAND_UPDATES = [
  {
    oldSlug: "aero",
    newName: "Nikke",
    newSlug: "nikke",
    shoeImage:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&q=80&auto=format&fit=crop",
    tagline: "Just Do It. Differently.",
  },
  {
    oldSlug: "soleste",
    newName: "Adidass",
    newSlug: "adidass",
    shoeImage:
      "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&q=80&auto=format&fit=crop",
    tagline: "Impossible Is Nothing.",
  },
  {
    oldSlug: "pinnacle",
    newName: "Jourdann",
    newSlug: "jourdann",
    shoeImage:
      "https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=600&q=80&auto=format&fit=crop",
    tagline: "Elevate Your Game.",
  },
  {
    oldSlug: "vanguard",
    newName: "Balanse",
    newSlug: "balanse",
    shoeImage:
      "https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&q=80&auto=format&fit=crop",
    tagline: "Fearlessly Independent.",
  },
  {
    oldSlug: "heritage",
    newName: "Konverse",
    newSlug: "konverse",
    shoeImage:
      "https://images.unsplash.com/photo-1463100099107-aa0980c362e6?w=600&q=80&auto=format&fit=crop",
    tagline: "Always Original.",
  },
  {
    oldSlug: "equinox",
    newName: "Pumma",
    newSlug: "pumma",
    shoeImage:
      "https://images.unsplash.com/photo-1597045566677-8cf032ed6634?w=600&q=80&auto=format&fit=crop",
    tagline: "Forever Faster.",
  },
  {
    oldSlug: "kurashiki",
    newName: "Rebok",
    newSlug: "rebok",
    shoeImage:
      "https://images.unsplash.com/photo-1556906781-9a412961a28f?w=600&q=80&auto=format&fit=crop",
    tagline: "Be More Human.",
  },
];

async function run() {
  await mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  console.log("✅ Connected to MongoDB\n");

  const db = mongoose.connection.db;
  const brandsCol = db.collection("brands");
  const productsCol = db.collection("products");

  for (const update of BRAND_UPDATES) {
    const brand = await brandsCol.findOne({
      slug: update.oldSlug,
    });

    if (!brand) {
      console.log(`⚠️  Brand with slug "${update.oldSlug}" NOT FOUND — skipping`);
      continue;
    }

    // Update brand document
    await brandsCol.updateOne(
      { _id: brand._id },
      {
        $set: {
          "name.en": update.newName,
          slug: update.newSlug,
          image: update.shoeImage,
          logo: update.shoeImage,
          tagline: update.tagline,
        },
      }
    );
    console.log(`✅ Brand renamed: "${update.oldSlug}" → "${update.newName}" (slug: ${update.newSlug})`);

    // Update all products that reference old slug
    if (update.oldSlug !== update.newSlug) {
      const prodResult = await productsCol.updateMany(
        { "brand.slug": update.oldSlug },
        {
          $set: {
            "brand.name": update.newName,
            "brand.slug": update.newSlug,
          },
        }
      );
      if (prodResult.modifiedCount > 0) {
        console.log(`   ↳ Updated ${prodResult.modifiedCount} products to new slug "${update.newSlug}"`);
      }
    }
  }

  console.log("\n🎉 All brands updated successfully!");
  await mongoose.disconnect();
}

run().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
