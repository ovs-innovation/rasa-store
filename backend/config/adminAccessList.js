/** Route keys used by admin sidebar (first path segment). */
const FULL_ADMIN_ACCESS_LIST = [
  "dashboard",
  "prescriptions",
  "new-sale",
  "orders",
  "categories",
  "sub-categories",
  "attributes",
  "products",
  "brands",
  "customers",
  "wholesalers",
  "faqs",
  "coupons",
  "push-notification",
  "reviews",
  "testimonials",
  "our-staff",
  "settings",
  "languages",
  "currencies",
  "store",
  "customization",
  "store-settings",
  "notifications",
  "edit-profile",
  "coming-soon",
  "customer-order",
  "product",
  "order",
];

const mergeAccessList = (role, accessList = []) => {
  const list = Array.isArray(accessList) ? accessList.filter(Boolean) : [];
  if (role === "Super Admin" || role === "Admin") {
    return [...new Set([...FULL_ADMIN_ACCESS_LIST, ...list])];
  }
  return list;
};

module.exports = { FULL_ADMIN_ACCESS_LIST, mergeAccessList };
