# Phase 2A.5 Final Cleanup Report

Generated after B2B/pharmacy sweep (pre–Phase 2B legal pages).

## Deleted Files

| File | Reason |
|------|--------|
| `admin/src/pages/Retailer.jsx` | B2B retailer admin page |
| `admin/src/components/wholesaler/WholesalerTable.jsx` | Wholesaler table |
| `admin/src/components/wholesaler/DocumentUploader.jsx` | Drug-license doc uploader |
| `admin/src/components/drawer/WholesalerDrawer.jsx` | Wholesaler create/edit drawer |
| `admin/src/hooks/useWholesalerSubmit.js` | Wholesaler form hook |
| `backend/lib/email-sender/templates/prescription-status/index.js` | Orphan prescription email |

**Note:** `WholesalerServices.js` never existed — logic was in `CustomerServices.js` (removed).

**Note:** `backend/routes/wholesalerRoutes.js` and `wholesalerController.js` never existed — wholesaler APIs lived under `customerRoutes` / `customerController` (removed).

**Note:** `frontend/src/components/modal/WholesalerModal.js` was already deleted in Phase 1.

## Schema Changes (code)

### Customer (`backend/models/Customer.js`)
Removed: `role`, all KYC/B2B fields (`aadhar`, `pan`, `gst`, `drugLicense*`, `shopName`, `wholesalerStatus`, etc.)

### Product (`backend/models/Product.js`)
Removed: `isWholesaler`, `wholePrice`, `minQuantity`, `batchNo`, `expDate`, `manufactureDate`, `composition`, `ingredients`, `howToUse`, `keyUses`, `safetyInformation`, `suitableFor`

### Notification (`backend/models/Notification.js`)
Removed: `prescriptionId`

## Migration Scripts (run after Atlas IP whitelist)

```bash
node backend/script/migrateRemoveB2BCustomerFields.js
node backend/script/migrateRemovePharmacyProductFields.js
node backend/script/migrateRemovePrescriptionNotifications.js
node backend/script/migrateRasaCategories.js
```

Docs: `backend/docs/CUSTOMER_MODEL_MIGRATION.md`, `backend/docs/PRODUCT_MODEL_MIGRATION.md`

## Remaining Pharmacy-Related Strings (intentional / Phase 2B)

| Category | Location |
|----------|----------|
| **Legal pages (Phase 2B — do not edit yet)** | `frontend/src/pages/faq.js`, `privacy-policy.js`, `terms-and-conditions.js`, `about-us.js`, `shipping-delivery-policy.js` |
| **Legacy seed/demo data** | `backend/utils/products.js`, `admin/src/utils/products.js`, `admin/src/utils/orders.js`, `backend/script/live_demo_seeder.js` |
| **Fashion slug shim** | `frontend/src/utils/fashionMap.js` (`live-demo-medicine` mapping until catalog migrated) |
| **Reference doc (removed)** | Legacy pharmacy content doc deleted |
| **Migration script comments** | `backend/script/migrateRemove*.js` |

## Branding cleanup (completed)

- All user-facing Farmacy/Farmcy Kart references removed from app code, emails, admin copy, and sample imports
- Default Cloudinary folder: `rasa`
- Default store domain in examples: `rasastore.com`

| Location | Action |
|----------|--------|
| `admin/src/utils/translation/en.json` | Admin license/welcome boilerplate — low priority |
| `admin/package-lock.json` | Regenerates on `npm install` after `package.json` rename |
| `scratch/test_resend.js` | Dev scratch file |
| `backend/README.md`, `admin/README.md`, `frontend/README.md` | Docs — update in Phase 3 |
| `admin/public/offline.html` | Admin PWA offline page title |
| `backend/temp_api_res.json` | Temp API dump |

## Firebase

- `frontend/public/firebase-messaging-sw.js` and `admin/public/firebase-messaging-sw.js` — hardcoded config **cleared**; must match new RASA Firebase project + `NEXT_PUBLIC_FIREBASE_*` in `.env`
- Main app uses env-based config in `frontend/src/lib/firebase.js` (already correct)

## CORS

- Removed legacy pharmacy domains from `backend/api/index.js` allowed origins

## Cloudinary

- Default folder: `rasa`
- Email fallback logo: `rasa/brand/logo.png` via `backend/lib/brand-assets.js`
- Set `BRAND_LOGO_URL` or upload logo to Cloudinary `rasa/brand/`

## Wholesaler Code Status

Runtime code paths for wholesaler/B2B/pricing **removed** from frontend, admin, and backend controllers.

Only references left are in **migration scripts** and one **comment** in `backend/api/index.js` (uploads static path).
