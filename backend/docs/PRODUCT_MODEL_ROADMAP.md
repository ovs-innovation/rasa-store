# RASA Product Model — Deprecation Roadmap

> Legacy pharmacy fields are **deprecated**. Do not use in new RASA products.

## Deprecated fields (remove in v2 migration)

| Field | Pharmacy use | RASA replacement |
|-------|--------------|------------------|
| `batchNo` | Medicine batch tracking | — (remove) |
| `expDate` | Medicine expiry | — (remove) |
| `manufactureDate` | Pharma manufacturing date | — (remove) |
| `ingredients` | Drug ingredients | `productDescription` or `dynamicSections` |
| `composition` | Drug composition | `productDescription` |
| `keyUses` | Medical indications | `productHighlights` |
| `howToUse` | Dosage instructions | — (remove) |
| `safetyInformation` | Drug warnings | `disclaimer` (fashion returns/care) |
| `manufacturerDetails` | Pharma manufacturer | `brand` reference |
| `isWholesaler` | B2B pharmacy pricing | — (remove) |
| `wholePrice` | Wholesale price | — (remove) |
| `minQuantity` | B2B min order qty | — (remove) |

## Active RASA fields

| Field | Purpose |
|-------|---------|
| `brand` | Nike, Adidas, Jordan, etc. |
| `category` / `categories` | Sneakers, Bags, Slides, Accessories |
| `gender` | Men / Women / Unisex |
| `sku` | Stock keeping unit |
| `stock` | Inventory count |
| `prices.originalPrice` | MRP |
| `prices.price` | Selling price |
| `variantFilters` | Size (UK3–UK10), Color combinations |
| `attributes` / `variants` | Size + Color variant matrix |
| `suitableFor` | **Deprecated** — use `gender` instead |

## Category reset (RASA)

```
Sneakers | Bags | Slides | Accessories | Women | Men | New Arrivals | Sale
```

Run: `node backend/script/migrateRasaCategories.js`
