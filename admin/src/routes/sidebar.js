import {
  FiGrid,
  FiUsers,
  FiSettings,
  FiShoppingCart,
  FiLayers,
  FiHome,
  FiTag,
  FiAward,
  FiStar,
  FiPackage,
} from "react-icons/fi";

/**
 * RASA Admin — minimal navigation (essentials only).
 */
const sidebar = [
  {
    path: "/dashboard",
    icon: FiGrid,
    name: "Dashboard",
  },
  {
    path: "/orders",
    icon: FiShoppingCart,
    name: "Orders",
  },
  {
    path: "/products",
    icon: FiLayers,
    name: "Products",
  },
  {
    path: "/inventory",
    icon: FiPackage,
    name: "Stock",
  },
  {
    path: "/categories",
    icon: FiTag,
    name: "Categories",
  },
  {
    path: "/brands",
    icon: FiAward,
    name: "Brands",
  },
  {
    path: "/customers",
    icon: FiUsers,
    name: "Customers",
  },
  {
    path: "/reviews",
    icon: FiStar,
    name: "Reviews",
  },
  {
    path: "/homepage",
    icon: FiHome,
    name: "Homepage",
  },
  {
    icon: FiSettings,
    name: "Settings",
    routes: [
      { path: "/settings/general", name: "General" },
      { path: "/settings/payment", name: "Payment" },
      { path: "/settings/business", name: "Shipping" },
    ],
  },
];

export default sidebar;
