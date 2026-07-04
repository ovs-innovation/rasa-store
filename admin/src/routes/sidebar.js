import {
  FiGrid,
  FiUsers,
  FiUser,
  FiSettings,
  FiStar,
  FiGift,
  FiBox,
  FiShoppingCart,
  FiLayers,
  FiSlack,
  FiHome,
  FiPackage,
} from "react-icons/fi";

/**
 * RASA Admin — premium fashion store navigation.
 * Phase 1: Orders, Catalog, Inventory, Homepage Manager submenus.
 */
const sidebar = [
  {
    path: "/dashboard",
    icon: FiGrid,
    name: "Dashboard",
  },
  {
    icon: FiShoppingCart,
    name: "Orders",
    routes: [
      { path: "/orders", name: "All Orders" },
      { path: "/orders/pending", name: "Pending Orders" },
      { path: "/orders/processing", name: "Processing Orders" },
      { path: "/orders/on-the-way", name: "Shipped Orders" },
      { path: "/orders/delivered", name: "Delivered Orders" },
      { path: "/orders/canceled", name: "Cancelled Orders" },
      { path: "/orders/refunded", name: "Returned Orders" },
      { path: "/orders/refund-requested", name: "Refund Requests" },
    ],
  },
  {
    icon: FiLayers,
    name: "Catalog",
    routes: [
      { path: "/products", name: "Products" },
      { path: "/categories", name: "Categories" },
      { path: "/sub-categories", name: "Sub Categories" },
      { path: "/brands", name: "Brands" },
      { path: "/attributes", name: "Attributes" },
      { path: "/reviews", name: "Reviews" },
    ],
  },
  {
    icon: FiPackage,
    name: "Inventory",
    routes: [
      { path: "/inventory", name: "Stock Overview" },
      { path: "/inventory/low-stock", name: "Low Stock" },
      { path: "/inventory/out-of-stock", name: "Out Of Stock" },
    ],
  },
  {
    icon: FiHome,
    name: "Homepage Manager",
    routes: [
      { path: "/homepage", name: "Overview" },
      { path: "/homepage/hero", name: "Hero Banners" },
      { path: "/homepage/trending", name: "Trending Products" },
      { path: "/homepage/new-arrivals", name: "New Arrivals" },
      { path: "/homepage/brands", name: "Shop By Brand" },
      { path: "/homepage/categories", name: "Shop By Category" },
      { path: "/homepage/reviews", name: "Customer Reviews" },
      { path: "/homepage/footer", name: "Footer Text" },
      { path: "/homepage/instagram", name: "Instagram Feed" },
      { path: "/homepage/order", name: "Section Ordering" },
    ],
  },
  {
    type: "title",
    name: "Customers & Marketing",
  },
  {
    path: "/customers",
    icon: FiUsers,
    name: "Customers",
  },
  {
    path: "/coupons",
    icon: FiGift,
    name: "Coupons",
  },
  {
    icon: FiSettings,
    name: "Settings",
    routes: [
      { path: "/settings/general", name: "General Settings" },
      { path: "/settings/payment", name: "Payment Methods" },
      { path: "/settings/business", name: "Shipping Methods" },
      { path: "/store/customization?storeTab=seo-settings", name: "SEO Settings" },
    ],
  },
  {
    path: "/our-staff",
    icon: FiUser,
    name: "Admins",
  },
];

export default sidebar;
