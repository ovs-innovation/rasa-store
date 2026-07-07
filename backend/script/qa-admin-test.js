const axios = require("axios");

const BASE = "http://localhost:8092/api";

const results = [];
const pass = (name, detail = "") => results.push({ status: "PASS", name, detail });
const fail = (name, detail = "") => results.push({ status: "FAIL", name, detail });
const warn = (name, detail = "") => results.push({ status: "WARN", name, detail });

async function run() {
  let token = "";

  try {
    await axios.get(`${BASE}/setting/store-setting/all`, { timeout: 8000 });
    pass("Backend reachable", "store-setting OK");
  } catch (e) {
    fail("Backend reachable", e.message);
    printReport();
    process.exit(1);
  }

  const creds = [
    { email: "admin@rasastore.com", password: "RasaStore@123" },
    { email: "admin@gmail.com", password: "12345678" },
    { email: "admin@gmail.com", password: "Admin@123" },
  ];

  for (const c of creds) {
    try {
      const r = await axios.post(`${BASE}/admin/login`, c);
      if (r.data?.token) {
        token = r.data.token;
        pass("Admin login", c.email);
        break;
      }
    } catch (_) {}
  }

  if (!token) fail("Admin login", "No working credentials");

  const auth = { headers: { Authorization: `Bearer ${token}` } };

  try {
    const r = await axios.get(`${BASE}/category/show`, auth);
    const cats = r.data || [];
    const hasSlug = cats.some((c) => c.slug);
    const names = cats.map((c) => c.name?.en || c.name || "").join(", ");
    if (cats.length) {
      pass("Categories API", `${names}${hasSlug ? " (slug OK)" : " (NO SLUG)"}`);
    } else {
      warn("Categories API", "empty list");
    }
    if (!hasSlug && cats.length) {
      fail("Category slug in tree", "ParentCategory dropdown may be empty");
    }
  } catch (e) {
    fail("Categories API", e.response?.data?.message || e.message);
  }

  try {
    const r = await axios.post(`${BASE}/category/sync-shop`, {}, auth);
    pass("Category sync-shop", r.data?.message || "OK");
  } catch (e) {
    fail("Category sync-shop", e.response?.data?.message || e.message);
  }

  try {
    const r = await axios.get(`${BASE}/brand/`, auth);
    const n = (r.data || []).length;
    if (n) pass("Brands API", `${n} brands`);
    else warn("Brands API", "no brands - brand dropdown empty");
  } catch (e) {
    fail("Brands API", e.response?.data?.message || e.message);
  }

  try {
    const r = await axios.get(`${BASE}/products?page=1&limit=5`, auth);
    const count = r.data?.products?.length ?? r.data?.length ?? 0;
    pass("Products list", `${count} products`);
  } catch (e) {
    fail("Products list", e.response?.data?.message || e.message);
  }

  if (token) {
    try {
      const catRes = await axios.get(`${BASE}/category/show`, auth);
      const cat =
        (catRes.data || []).find(
          (c) => c.parentId === null || c.parentId === "0" || !c.parentId
        ) || catRes.data?.[0];
      const brandRes = await axios.get(`${BASE}/brand/`, auth);
      const brand = brandRes.data?.[0];
      const slug = `qa-test-product-${Date.now()}`;
      const imgs = [
        "https://res.cloudinary.com/dsazjohhf/image/upload/v1/test/img1.jpg",
        "https://res.cloudinary.com/dsazjohhf/image/upload/v1/test/img2.jpg",
        "https://res.cloudinary.com/dsazjohhf/image/upload/v1/test/img3.jpg",
      ];
      const payload = {
        title: { en: `QA Test Sneaker ${Date.now()}` },
        description: { en: "Automated test product" },
        slug,
        categories: cat?._id ? [cat._id] : [],
        category: cat?._id,
        brand: brand?._id || null,
        gender: "Unisex",
        productType: "Sneakers",
        image: imgs,
        featuredImage: imgs,
        hoverImage: imgs.slice(1),
        stock: 10,
        status: "show",
        tag: [],
        prices: {
          originalPrice: 9999,
          price: 7999,
          salePrice: 0,
          discount: 2000,
          discountType: "flat",
        },
        isCombination: false,
        variants: [],
      };

      if (!cat?._id) {
        warn("Add product test", "skipped - no category");
      } else {
        const r = await axios.post(`${BASE}/products/add`, payload, auth);
        const p = r.data;
        const fiOk = typeof p.featuredImage === "string" && !Array.isArray(p.featuredImage);
        const hiOk = typeof p.hoverImage === "string" && !Array.isArray(p.hoverImage);
        if (fiOk && hiOk) {
          pass("Add product (image fix)", `featured=${p.featuredImage.slice(0, 50)}...`);
        } else {
          fail(
            "Add product (image fix)",
            JSON.stringify({
              featuredImage: typeof p.featuredImage,
              hoverImage: typeof p.hoverImage,
            })
          );
        }
        if (p._id) {
          await axios.delete(`${BASE}/products/${p._id}`, auth).catch(() => {});
        }
      }
    } catch (e) {
      fail("Add product (image fix)", e.response?.data?.message || e.message);
    }
  }

  try {
    await axios.get(`${BASE}/orders?page=1&limit=3`, auth);
    pass("Orders API", "OK");
  } catch (e) {
    fail("Orders API", e.response?.data?.message || e.message);
  }

  try {
    await axios.get(`${BASE}/orders/dashboard`, auth);
    pass("Dashboard stats", "OK");
  } catch (e) {
    fail("Dashboard stats", e.response?.data?.message || e.message);
  }

  try {
    await axios.get(`${BASE}/refund/all`, auth);
    fail("Refund API removed", "route still active");
  } catch (e) {
    if (e.response?.status === 404) pass("Refund API removed", "404");
    else pass("Refund API removed", `not accessible (${e.response?.status || ""})`);
  }

  if (token) {
    try {
      const catRes = await axios.get(`${BASE}/category/show`, auth);
      const cat = catRes.data?.[0];
      const slug = `qa-heels-${Date.now()}`;
      const payload = {
        title: { en: "QA Heels Test" },
        description: { en: "test" },
        slug,
        categories: [cat._id],
        category: cat._id,
        gender: "Women",
        productType: "Heels",
        image: ["https://res.cloudinary.com/dsazjohhf/image/upload/v1/test/h.jpg"],
        featuredImage: "https://res.cloudinary.com/dsazjohhf/image/upload/v1/test/h.jpg",
        hoverImage: "https://res.cloudinary.com/dsazjohhf/image/upload/v1/test/h.jpg",
        stock: 1,
        status: "show",
        tag: [],
        prices: {
          originalPrice: 5000,
          price: 4000,
          salePrice: 0,
          discount: 1000,
          discountType: "flat",
        },
        isCombination: false,
        variants: [],
      };
      const r = await axios.post(`${BASE}/products/add`, payload, auth);
      pass("Heels productType enum", "saved OK");
      if (r.data?._id) {
        await axios.delete(`${BASE}/products/${r.data._id}`, auth).catch(() => {});
      }
    } catch (e) {
      fail("Heels productType enum", e.response?.data?.message || e.message);
    }
  }

  try {
    const r = await axios.get("http://localhost:4100/", { timeout: 5000 });
    if (r.status === 200) pass("Admin UI serving", "localhost:4100");
    else warn("Admin UI serving", `status ${r.status}`);
  } catch (e) {
    fail("Admin UI serving", e.message);
  }

  printReport();
  process.exit(results.some((r) => r.status === "FAIL") ? 1 : 0);
}

function printReport() {
  console.log("\n=== ADMIN PANEL QA REPORT ===\n");
  for (const r of results) {
    const icon = r.status === "PASS" ? "✓" : r.status === "WARN" ? "!" : "✗";
    console.log(`${icon} [${r.status}] ${r.name}${r.detail ? ` — ${r.detail}` : ""}`);
  }
  const fails = results.filter((r) => r.status === "FAIL").length;
  const warns = results.filter((r) => r.status === "WARN").length;
  console.log(`\nTotal: ${results.length} | FAIL: ${fails} | WARN: ${warns}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
