import { lazy } from "react";

// use lazy for better code splitting
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Attributes = lazy(() => import("@/pages/Attributes"));
const ChildAttributes = lazy(() => import("@/pages/ChildAttributes"));
const Products = lazy(() => import("@/pages/Products"));
const Brands = lazy(() => import("@/pages/Brands"));
const ProductDetails = lazy(() => import("@/pages/ProductDetails"));
const Category = lazy(() => import("@/pages/Category"));
const ChildCategory = lazy(() => import("@/pages/ChildCategory"));
const Staff = lazy(() => import("@/pages/Staff"));
const Customers = lazy(() => import("@/pages/Customers"));
const AddProduct = lazy(() => import("@/pages/AddProduct"));
const EditProduct = lazy(() => import("@/pages/EditProduct"));
const NewItemRequest = lazy(() => import("@/pages/NewItemRequest"));
const ProductBulkImport = lazy(() => import("@/pages/ProductBulkImport"));
const ProductBulkExport = lazy(() => import("@/pages/ProductBulkExport"));
const ProductGallery = lazy(() => import("@/pages/ProductGallery"));
const CustomerOrder = lazy(() => import("@/pages/CustomerOrder"));
const Orders = lazy(() => import("@/pages/Orders"));
const OrderInvoice = lazy(() => import("@/pages/OrderInvoice"));
const Coupons = lazy(() => import("@/pages/Coupons"));
// const Setting = lazy(() => import("@/pages/Setting"));
const Page404 = lazy(() => import("@/pages/404"));
const ComingSoon = lazy(() => import("@/pages/ComingSoon"));
const NewSale = lazy(() => import("@/pages/NewSale"));
const EditProfile = lazy(() => import("@/pages/EditProfile"));
const Languages = lazy(() => import("@/pages/Languages"));
const Currencies = lazy(() => import("@/pages/Currencies"));
const Setting = lazy(() => import("@/pages/Setting"));
const StoreHome = lazy(() => import("@/pages/StoreHome"));
const StoreSetting = lazy(() => import("@/pages/StoreSetting"));
const Notifications = lazy(() => import("@/pages/Notifications"));
const Taxes = lazy(() => import("@/pages/Taxes"));
const Reviews = lazy(() => import("@/pages/Reviews"));
const CategoryBulkImport = lazy(() => import("@/pages/CategoryBulkImport"));
const CategoryBulkExport = lazy(() => import("@/pages/CategoryBulkExport"));
const LowStock = lazy(() => import("@/pages/LowStock"));
const StockOverview = lazy(() => import("@/pages/StockOverview"));
const OutOfStock = lazy(() => import("@/pages/OutOfStock"));
const OrdersByStatus = lazy(() => import("@/pages/OrdersByStatus"));
const GeneralSettings = lazy(() => import("@/pages/settings/GeneralSettings"));
const BusinessSettings = lazy(() => import("@/pages/settings/BusinessSettings"));
// const BusinessInformation = lazy(() => import("@/pages/settings/BusinessInformation"));
const PaymentSettings = lazy(() => import("@/pages/settings/PaymentSettings"));
const VendorSettings = lazy(() => import("@/pages/settings/VendorSettings"));
const OrderSettings = lazy(() => import("@/pages/settings/OrderSettings"));
// const DeliveryManSettings = lazy(() => import("@/pages/settings/DeliveryManSettings"));

const Faqs = lazy(() => import("@/pages/Faqs"));
const PushNotification = lazy(() => import("@/pages/PushNotification"));
const Testimonials = lazy(() => import("@/pages/Testimonials"));
const RasaHomepage = lazy(() => import("@/pages/RasaHomepage"));
/*
//  * ⚠ These are internal routes!
//  * They will be rendered inside the app, using the default `containers/Layout`.
//  * If you want to add a route to, let's say, a landing page, you should add
//  * it to the `App`'s router, exactly like `Login`, `CreateAccount` and other pages
//  * are routed.
//  *
//  * If you're looking for the links rendered in the SidebarContent, go to
//  * `routes/sidebar.js`
 */

const routes = [
  {
    path: "/dashboard",
    component: Dashboard,
  },
  {
    path: "/new-sale",
    component: NewSale,
  },

  {
    path: "/orders/scheduled",
    component: OrdersByStatus,
  },
  {
    path: "/orders/pending",
    component: OrdersByStatus,
  },
  {
    path: "/orders/accepted",
    component: OrdersByStatus,
  },
  {
    path: "/orders/processing",
    component: OrdersByStatus,
  },
  {
    path: "/orders/on-the-way",
    component: OrdersByStatus,
  },
  {
    path: "/orders/delivered",
    component: OrdersByStatus,
  },
  {
    path: "/orders/canceled",
    component: OrdersByStatus,
  },
  {
    path: "/orders/payment-failed",
    component: OrdersByStatus,
  },
  {
    path: "/orders/offline-payments",
    component: OrdersByStatus,
  },
  {
    path: "/products",
    component: Products,
  },
  {
    path: "/products/add",
    component: AddProduct,
  },
  {
    path: "/products/edit/:id",
    component: EditProduct,
  },
  {
    path: "/products/new-request",
    component: NewItemRequest,
  },
  {
    path: "/products/bulk-import",
    component: ProductBulkImport,
  },
  {
    path: "/products/bulk import",
    component: ProductBulkImport,
  },
  {
    path: "/products/bulk-export",
    component: ProductBulkExport,
  },
  {
    path: "/products/bulk export",
    component: ProductBulkExport,
  },
  {
    path: "/products/low-stock",
    component: LowStock,
  },
  {
    path: "/inventory",
    component: StockOverview,
  },
  {
    path: "/inventory/low-stock",
    component: LowStock,
  },
  {
    path: "/inventory/out-of-stock",
    component: OutOfStock,
  },
  {
    path: "/products/gallery",
    component: ProductGallery,
  },
  {
    path: "/brands",
    component: Brands,
  },
  {
    path: "/attributes",
    component: Attributes,
  },
  {
    path: "/attributes/:id",
    component: ChildAttributes,
  },
  {
    path: "/product/:id",
    component: ProductDetails,
  },
  {
    path: "/categories",
    component: Category,
  },
  {
    path: "/languages",
    component: Languages,
  },
  {
    path: "/currencies",
    component: Currencies,
  },

  {
    path: "/sub-categories",
    component: ChildCategory,
  },
  {
    path: "/bulk-import",
    component: CategoryBulkImport,
  },
  {
    path: "/bulk-export",
    component: CategoryBulkExport,
  },
  {
    path: "/categories/:id",
    component: ChildCategory,
  },
  {
    path: "/customers",
    component: Customers,
  },
  {
    path: "/customer-order/:id",
    component: CustomerOrder,
  },
  {
    path: "/our-staff",
    component: Staff,
  },
  {
    path: "/orders",
    component: Orders,
  },
  {
    path: "/order/:id",
    component: OrderInvoice,
  },
  {
    path: "/coupons",
    component: Coupons,
  },
  {
    path: "/taxes",
    component: Taxes,
  },
  {
    path: "/reviews",
    component: Reviews,
  },
  {
    path: "/faqs",
    component: Faqs,
  },
  {
    path: "/push-notification",
    component: PushNotification,
  },

  {
    path: "/testimonials",
    component: Testimonials,
  },
  { path: "/settings", component: Setting },
  { path: "/settings/general", component: GeneralSettings },
  { path: "/settings/business", component: BusinessSettings },
  // { path: "/settings/business-information", component: BusinessInformation },
  { path: "/settings/payment", component: PaymentSettings },
  { path: "/settings/retailer", component: VendorSettings },
  { path: "/settings/order", component: OrderSettings },
  { path: "/settings/taxes", component: Taxes },
  // { path: "/settings/delivery-man", component: DeliveryManSettings },
  {
    path: "/store/customization",
    component: StoreHome,
  },
  {
    path: "/store/store-settings",
    component: StoreSetting,
  },
  // {
  //   path: "/404",
  //   component: Page404,
  // },
  // {
  //   path: "/coming-soon",
  //   component: ComingSoon,
  // },
  {
    path: "/homepage",
    component: RasaHomepage,
  },
  {
    path: "/edit-profile",
    component: EditProfile,
  },
  {
    path: "/notifications",
    component: Notifications,
  },
];

const routeAccessList = [
  { label: "Dashboard", value: "dashboard" },
  { label: "Products", value: "products" },
  { label: "Categories", value: "categories" },
  { label: "Customers", value: "customers" },
  { label: "Orders", value: "orders" },
  { label: "Homepage Manager", value: "homepage" },
  { label: "Settings", value: "settings" },
  { label: "Product Details", value: "product" },
  { label: "Order Invoice", value: "order" },
  { label: "Edit Profile", value: "edit-profile" },
  { label: "Customer Order", value: "customer-order" },
];

export { routeAccessList, routes };
