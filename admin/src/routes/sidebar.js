import {
  FiGrid,
  FiUsers,
  FiUser,
  FiCompass,
  FiSettings,
  FiSlack,
  FiGlobe,
  FiTarget,
  FiStar,
  FiHelpCircle,
  FiFileText,
  FiMail,
  FiMessageCircle,
  FiList,
  FiLayers,
  FiBox,
  FiShoppingCart,
  FiRotateCcw,
  FiGift,
} from "react-icons/fi";

/**
 * ⚠ These are used just to render the Sidebar!
 * You can include any link here, local or external.
 *
 * If you're looking to actual Router routes, go to
 * `routes/index.js`
 */
const sidebar = [
  {
    path: "/dashboard", // the url
    icon: FiGrid, // icon
    name: "Dashboard", // name that appear in Sidebar
  },
  {
    path: "/prescriptions",
    icon: FiFileText,
    name: "Prescriptions",
  },
  {
    type: "title",
    name: "POS SECTION"
  },
  {
    path: "/new-sale",
    icon: FiShoppingCart,
    name: "New Sale",
  },

  {
    type: "title",
    name: "Order Management",
  },
  {
    heading: "ORDER MANAGEMENT",
  },
  {
    icon: FiCompass,
    name: "Orders",
    routes: [
      {
        path: "/orders",
        name: "All",
      },
      {
        path: "/orders/scheduled",
        name: "Scheduled",
      },
      {
        path: "/orders/pending",
        name: "Pending",
      },
      {
        path: "/orders/accepted",
        name: "Accepted",
      },
      {
        path: "/orders/processing",
        name: "Processing",
      },
      {
        path: "/orders/on-the-way",
        name: "Order On The Way",
      },
      {
        path: "/orders/delivered",
        name: "Delivered",
      },
      {
        path: "/orders/canceled",
        name: "Canceled",
      },
      {
        path: "/orders/payment-failed",
        name: "Payment Failed",
      },
      {
        path: "/orders/refunded",
        name: "Refunded",
      },
      {
        path: "/orders/offline-payments",
        name: "Offline Payments",
      },
    ],
  },

  {
    icon: FiLayers,
    name: "Categories",
    routes: [
      {
        path: "/categories",
        name: "Category",
      },
      {
        path: "/sub-categories",
        name: "Sub Category",
      },
    ],
  },
  {
    path: "/attributes",
    icon: FiGrid,
    name: "Attributes",
  },
  // {
  //   path: "/units",
  //   icon: FiList,
  //   name: "Units",
  // },
  // {
  //   path: "/common-conditions",
  //   icon: FiList,
  //   name: "CommonConditions",
  // },
  {
    icon: FiBox,
    name: "Product Setup",
    routes: [
      {
        path: "/products/add",
        name: "AddNew",
      },
      {
        path: "/products",
        name: "List",
      },
      {
        path: "/products/low-stock",
        name: "Low Stock List",
      },
      {
        path: "/products/gallery",
        name: "Product Gallery",
      },
      {
        path: "/products/new-request",
        name: "New Item Request",
      },

      {
        path: "/products/bulk-import",
        name: "Bulk Import",
      },
      {
        path: "/products/bulk-export",
        name: "Bulk Export",
      },
    ],
  },

  {
    icon: FiSlack,
    name: "Catalog",
    routes: [
      {
        path: "/brands",
        name: "Brands",
      },
    ],
  },

  // {
  //   path: "/orders",
  //   icon: FiCompass,
  //   name: "Orders",
  // },

  {
    icon: FiUsers,
    name: "Users",
    routes: [
      {
        path: "/customers",
        name: "Customers",
      },
      {
        path: "/wholesalers",
        name: "Retailers",
      },
    ],
  },

  {
    path: "/faqs",
    icon: FiHelpCircle,
    name: "FAQs",
  },
  {
    path: "/coupons",
    icon: FiGift,
    name: "Coupons",
  },
  {
    path: "/push-notification",
    icon: FiMessageCircle,
    name: "Push Notification",
  },
  {
    path: "/reviews",
    icon: FiStar,
    name: "Reviews",
  },

  {
    path: "/testimonials",
    icon: FiMessageCircle,
    name: "Testimonials",
  },

  {
    path: "/our-staff",
    icon: FiUser,
    name: "OurStaff",
  },

  {
    icon: FiSettings,
    name: "Settings",
    routes: [
      {
        path: "/settings/general",
        name: "General Settings",
      },
      {
        path: "/settings/business",
        name: "Business Settings",
      },
      // {
      //   path: "/settings/business-information",
      //   name: "BusinessInformation",
      // },
      {
        path: "/settings/payment",
        name: "Payment",
      },
      {
        path: "/settings/Retailer",
        name: "Retailer",
      },
      {
        path: "/settings/order",
        name: "Order",
      },
      {
        path: "/settings/refund",
        name: "Refund",
      },
      {
        path: "/settings/taxes",
        name: "Taxes",
      },
      // {
      //   path: "/settings/delivery-man",
      //   name: "DeliveryMan",
      // },
    ],
  },
  {
    icon: FiGlobe,
    name: "International",
    routes: [
      {
        path: "/languages",
        name: "Languages",
      },
      {
        path: "/currencies",
        name: "Currencies",
      },
    ],
  },
  {
    icon: FiTarget,
    name: "OnlineStore",
    routes: [
      // {
      //   name: "ViewStore",
      //   path: "/store",
      //   outside: "store",
      // },

      {
        path: "/store/customization",
        name: "Store Customization",
      },
      {
        path: "/store/store-settings",
        name: "Store Settings",
      },
    ],
  },

  // {
  //   icon: FiSlack,
  //   name: "Pages",
  //   routes: [
  //     // submenu

  //     {
  //       path: "/404",
  //       name: "404",
  //     },
  //     {
  //       path: "/coming-soon",
  //       name: "Coming Soon",
  //     },
  //   ],
  // },
];

export default sidebar;
