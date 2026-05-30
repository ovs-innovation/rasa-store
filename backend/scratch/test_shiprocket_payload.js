/* eslint-disable no-console */
const { mapShiprocketAddressFields, normalizeCountryState } = require("../utils/shiprocketAddressMapper");
const {
  resolveLineItemHsn,
  DEFAULT_SHIPROCKET_HSN,
  enrichOrderItemsForShiprocket,
} = require("../utils/cartTaxUtils");

let passed = 0;
let failed = 0;

function assert(condition, message) {
  if (condition) {
    passed += 1;
    console.log(`  PASS: ${message}`);
  } else {
    failed += 1;
    console.error(`  FAIL: ${message}`);
  }
}

console.log("\n=== Address mapper ===\n");

const legacy = mapShiprocketAddressFields({
  billing_country: "Maharashtra",
  billing_state: "",
  billing_city: "Mumbai",
  shipping_country: "Maharashtra",
  shipping_state: "",
  shipping_city: "Mumbai",
});

assert(legacy.billing_country === "India", "billing_country is India");
assert(legacy.billing_state === "Maharashtra", "billing_state is Maharashtra");
assert(legacy.shipping_country === "India", "shipping_country is India");
assert(legacy.shipping_state === "Maharashtra", "shipping_state is Maharashtra");

const correct = mapShiprocketAddressFields({
  billing_country: "India",
  billing_state: "Karnataka",
  billing_city: "Bengaluru",
});

assert(correct.billing_country === "India", "correct billing_country unchanged");
assert(correct.billing_state === "Karnataka", "correct billing_state unchanged");

const { country, state } = normalizeCountryState("maharashtra", "");
assert(country === "India" && state === "Maharashtra", "normalizeCountryState legacy");

console.log("\n=== HSN resolver ===\n");

assert(resolveLineItemHsn({ hsn: "3004" }) === "3004", "uses hsn field");
assert(resolveLineItemHsn({ hsnCode: "2106" }) === "2106", "uses hsnCode field");
assert(
  resolveLineItemHsn({}) === DEFAULT_SHIPROCKET_HSN,
  `fallback HSN is ${DEFAULT_SHIPROCKET_HSN}`
);

console.log("\n=== enrichOrderItemsForShiprocket (no DB) ===\n");

(async () => {
  const items = await enrichOrderItemsForShiprocket(
    [
      { name: "Test Product", sku: "SKU-1", units: 2, selling_price: "100" },
    ],
    [{ title: "Test Product", sku: "SKU-1", quantity: 2, price: 100, hsnCode: "30049099" }]
  );

  assert(items.length === 1, "one line item");
  assert(items[0].hsn === "30049099", "HSN from cart hsnCode");
  assert(String(items[0].selling_price) === "100", "selling_price preserved");

  const itemsFallback = await enrichOrderItemsForShiprocket(
    [{ name: "No HSN Product", sku: "SKU-2", units: 1, selling_price: "50" }],
    []
  );
  assert(itemsFallback[0].hsn === DEFAULT_SHIPROCKET_HSN, "fallback HSN when cart empty");

  console.log("\n=== Sample legacy Shiprocket body (mapper only) ===\n");
  const sampleBody = {
    order_id: "TEST-001",
    billing_customer_name: "Test",
    billing_city: "Pune",
    billing_pincode: "411001",
    billing_country: "Maharashtra",
    billing_state: "",
    order_items: [{ name: "Item", sku: "1", units: 1, selling_price: "10", hsn: "" }],
  };
  const mapped = mapShiprocketAddressFields(sampleBody);
  const enrichedItems = await enrichOrderItemsForShiprocket(
    sampleBody.order_items,
    [{ id: "1", hsnCode: "3305", price: 10, quantity: 1 }]
  );

  console.log(
    JSON.stringify(
      {
        billing_country: mapped.billing_country,
        billing_state: mapped.billing_state,
        order_items_hsn: enrichedItems.map((i) => i.hsn),
      },
      null,
      2
    )
  );

  assert(mapped.billing_country === "India", "sample body country");
  assert(mapped.billing_state === "Maharashtra", "sample body state");
  assert(enrichedItems.every((i) => i.hsn && i.hsn.length > 0), "all items have HSN");

  console.log(`\n=== Results: ${passed} passed, ${failed} failed ===\n`);
  process.exit(failed > 0 ? 1 : 0);
})();
