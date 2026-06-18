# RASA Admin Architecture

> **RASA Admin Architecture**

## Core platform modules (reused)

- Auth / JWT
- Product, Order, Coupon, Cart, Checkout APIs
- Payment integration (Stripe, Razorpay, COD)
- Shiprocket
- Reviews & notifications
- Admin RBAC

## Removed from Admin

- Prescriptions, Wholesalers, Retailers
- Pharmacy product fields (batch, expiry, composition, etc.)
- POS / New Sale (hidden from sidebar — route still exists if needed)
- Legacy grocery homepage tabs (replaced by Homepage Manager)

## RASA Admin Sidebar

```
Dashboard
Products → Add / All / Low Stock
Categories
Brands
Attributes
Orders
Customers
Coupons
Reviews
Homepage Manager
Settings
Admins
```

## Product Form Fields

Name, Brand, Category, Gender, MRP, Sale Price, UK Sizes (checkbox + attributes), Colors (attributes), Stock, SKU, Description, Gallery, Homepage flags (Featured / New Arrival / Trending / Sale).

## Homepage Manager

Saved under `storeCustomizationSetting.setting.rasaHomepage`:

- Hero slides (copy + links)
- Brands section toggle
- Instagram posts
- Trending / New Arrival product picks
- Category banners

## DB Seeds

```bash
node backend/script/migrateRasaCategories.js
node backend/script/migrateRasaBrands.js
```

Categories: Sneakers, Bags, Slides, Accessories, Women, Men, Sale, New Arrivals

Brands: Nike, Adidas, Jordan, Puma, New Balance, Converse
