/**
 * End-to-end API smoke test for RASA storefront flows.
 * Run: node backend/script/flowSmokeTest.js
 */
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });
const mongoose = require("mongoose");
const { checkStock, handleProductQuantity } = require("../lib/stock-controller/others");

const API = process.env.SMOKE_API_BASE || "http://127.0.0.1:8092/api";

const results = [];
const pass = (name, detail = "") => results.push({ ok: true, name, detail });
const fail = (name, detail = "") => results.push({ ok: false, name, detail });

async function fetchJson(path) {
  const res = await fetch(`${API}${path}`);
  const text = await res.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = text;
  }
  return { status: res.status, data };
}

async function testApi() {
  const store = await fetchJson("/products/store");
  if (store.status !== 200) {
    fail("GET /products/store", `status ${store.status}`);
    return;
  }
  pass("GET /products/store", `products: ${store.data?.products?.length || 0}`);

  const visible = (store.data?.products || []).filter((p) => p.status === "show");
  if (visible.length > 0) pass("Store products visible", `${visible.length} with status show`);
  else fail("Store products visible", "no show products");

  const newArrivals = store.data?.popularProducts || [];
  const trending = store.data?.bestSellingProducts || [];
  if (newArrivals.length > 0) pass("New arrivals section", `${newArrivals.length} products`);
  else fail("New arrivals section", "empty — wire IDs in Homepage Manager");

  if (trending.length > 0) pass("Trending section", `${trending.length} products`);
  else fail("Trending section", "empty — wire IDs in Homepage Manager");

  const hp = store.data?.rasaHomepage;
  if (hp) pass("Homepage CMS payload", `hero: ${hp.heroSlides?.length || 0}, categories: ${hp.categoryBanners?.length || 0}`);
  else fail("Homepage CMS payload", "missing rasaHomepage");

  const sample = visible[0] || store.data?.products?.[0];
  if (!sample?.slug) {
    fail("Product by slug", "no sample product");
    return;
  }

  const bySlug = await fetchJson(`/products/product/${sample.slug}`);
  if (bySlug.status === 200 && bySlug.data?._id) {
    pass("GET /products/product/:slug", sample.slug);
  } else {
    fail("GET /products/product/:slug", `status ${bySlug.status}`);
  }

  const categories = await fetchJson("/category/show");
  if (categories.status === 200 && Array.isArray(categories.data)) {
    pass("GET /category/show", `${categories.data.length} roots`);
  } else {
    fail("GET /category/show", `status ${categories.status}`);
  }

  const brands = await fetchJson("/brand/show");
  if (brands.status === 200 && Array.isArray(brands.data)) {
    pass("GET /brand/show", `${brands.data.length} brands`);
  } else {
    fail("GET /brand/show", `status ${brands.status}`);
  }
}

async function testStockLogic() {
  const { connectDB } = require("../config/db");
  await connectDB();
  const Product = require("../models/Product");

  const product = await Product.findOne({ status: "show", stock: { $gt: 0 } });
  if (!product) {
    fail("Stock check (simple)", "no in-stock product in DB");
    await mongoose.connection.close();
    return;
  }

  const cartItem = {
    _id: product._id,
    id: String(product._id),
    title: product.title?.en || "Test",
    quantity: 1,
    isCombination: false,
  };

  const oos = await checkStock([cartItem]);
  if (oos.length === 0) pass("Stock check (simple)", `product ${product.slug || product._id}`);
  else fail("Stock check (simple)", JSON.stringify(oos[0]));

  const variantProduct = await Product.findOne({
    status: "show",
    $or: [
      { "variantFilters.0": { $exists: true } },
      { "variants.sizes.0": { $exists: true } },
    ],
  });

  if (variantProduct) {
    let variantRef = null;
    if (variantProduct.variantFilters?.length) {
      const vf = variantProduct.variantFilters.find((v) => Number(v.quantity) > 0) || variantProduct.variantFilters[0];
      variantRef = {
        color: vf.attributes?.color,
        size: vf.attributes?.size,
        sku: vf.sku,
      };
    } else if (variantProduct.variants?.[0]?.sizes?.length) {
      const cv = variantProduct.variants[0];
      const sv = cv.sizes.find((s) => Number(s.quantity || s.stock) > 0) || cv.sizes[0];
      variantRef = { color: cv.color, size: sv.size, sku: sv.sku };
    }

    if (variantRef) {
      const vCart = {
        _id: variantProduct._id,
        id: String(variantProduct._id),
        title: "Variant test",
        quantity: 1,
        isCombination: true,
        variant: variantRef,
      };
      const vOos = await checkStock([vCart]);
      if (vOos.length === 0) pass("Stock check (variant)", variantProduct.slug || String(variantProduct._id));
      else fail("Stock check (variant)", JSON.stringify(vOos[0]));
    }
  } else {
    pass("Stock check (variant)", "skipped — no variant products in DB");
  }

  await mongoose.connection.close();
}

async function run() {
  console.log("\n=== RASA Flow Smoke Test ===\n");
  try {
    await testApi();
  } catch (err) {
    fail("API connectivity", err.message);
  }

  try {
    await testStockLogic();
  } catch (err) {
    fail("DB stock logic", err.message);
  }

  const failed = results.filter((r) => !r.ok);
  results.forEach((r) => {
    console.log(`${r.ok ? "PASS" : "FAIL"} — ${r.name}${r.detail ? `: ${r.detail}` : ""}`);
  });

  console.log(`\n${results.length - failed.length}/${results.length} passed`);
  if (failed.length) process.exit(1);
}

run();
