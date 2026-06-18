# Product Model Migration — Pharmacy → RASA Fashion

## Removed fields (Phase 2A.5)

| Field | Reason |
|-------|--------|
| `isWholesaler`, `wholePrice`, `minQuantity` | B2B retailer pricing |
| `batchNo`, `expDate`, `manufactureDate` | Medicine batch/expiry |
| `composition`, `ingredients`, `howToUse` | Pharmacy rich content |
| `keyUses`, `safetyInformation` | Pharmacy rich content |
| `suitableFor` | Replaced by `gender` |

## Kept (fashion)

`gender`, `productDescription`, `productHighlights`, `manufacturerDetails`, `disclaimer`, `dynamicSections`, `mediaSections`, `faqs`, variants, prices, brand, categories.

## Run migration

```bash
node backend/script/migrateRemovePharmacyProductFields.js
```

Uses `$unset` on all removed fields across the products collection.

## Rollback

Not supported — back up MongoDB before running.
