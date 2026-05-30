import requests from "./httpServices";

const CustomerServices = {
  checkCustomerExistance: async (body) => {
    return requests.post("/customer/check-user", body);
  },
  loginCustomer: async (body) => {
    return requests.post("/customer/login", body);
  },

  verifyEmailAddress: async (body) => {
    return requests.post("/customer/verify-email", body);
  },
  verifyPhoneNumber: async (body) => {
    return requests.post("/customer/verify-phone", body);
  },
  loginWithPhone: async (body) => {
    return requests.post("/customer/login-phone", body);
  },
  sendPhoneOtp: async (body) => {
    return requests.post("/customer/send-phone-otp", body);
  },
  verifyPhoneOtp: async (body) => {
    return requests.post("/customer/verify-phone-otp", body);
  },

  registerCustomer: async (token, body) => {
    return requests.post(`/customer/register/${token}`, body);
  },

  registerUser: async (body) => {
    return requests.post("/customer/signup", body);
  },

  createWholesaler: async (formData) => {
    // formData should be a FormData instance
    return requests.post(`/customer/wholesaler`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  signUpWithOauthProvider: async (body) => {
    return requests.post(`/customer/signup/oauth`, body);
  },

  signUpWithProvider(token, body) {
    return requests.post(`/customer/signup/${token}`, body);
  },

  forgetPassword: async (body) => {
    return requests.put("/customer/forget-password", body);
  },

  resetPassword: async (body) => {
    return requests.put("/customer/reset-password", body);
  },

  changePassword: async (body) => {
    return requests.post("/customer/change-password", body);
  },

  updateCustomer: async (id, body) => {
    return requests.put(`/customer/${id}`, body);
  },

  // Create wholesaler - accepts JSON payload with file URLs
  createWholesaler: async (body) => {
    return requests.post(`/customer/wholesaler`, body);
  },

  deleteCloudinary: async (body) => {
    return requests.post(`/customer/cloudinary-delete`, body);
  },

  getShippingAddress: async ({ userId = "", addressId = "" }) => {
    if (!userId) return null;
    const url = addressId
      ? `/customer/shipping/address/${userId}?id=${addressId}`
      : `/customer/shipping/address/${userId}`;
    return requests.get(url);
  },

  addShippingAddress: async ({ userId = "", shippingAddressData }) => {
    if (!userId) return null;
    return requests.post(
      `/customer/shipping/address/${userId}`,
      shippingAddressData
    );
  },

  updateShippingAddress: async ({ userId = "", shippingId = "", shippingAddressData }) => {
    return requests.put(
      `/customer/shipping/address/${userId}/${shippingId}`,
      shippingAddressData
    );
  },

  deleteShippingAddress: async ({ userId = "", shippingId = "" }) => {
    return requests.delete(
      `/customer/shipping/address/${userId}/${shippingId}`
    );
  },

  getCustomerById: async (id) => {
    return requests.get(`/customer/${id}`);
  },

  // ─── Cart API ───────────────────────────────────────────────────────────────

  /** Fetch the customer's cart (server-side, populated) */
  getCart: async (customerId) => {
    return requests.get(`/customer/cart/${customerId}`);
  },

  /** Add or increment a product in the DB cart */
  addToCartDB: async (customerId, productId, quantity = 1) => {
    return requests.post(`/customer/cart/${customerId}/add`, {
      productId,
      quantity,
    });
  },

  /** Set exact quantity for a product in the DB cart (pass 0 to remove) */
  updateCartItemDB: async (customerId, productId, quantity) => {
    return requests.put(`/customer/cart/${customerId}/update`, {
      productId,
      quantity,
    });
  },

  /** Remove a specific product from the DB cart */
  removeFromCartDB: async (customerId, productId) => {
    return requests.delete(
      `/customer/cart/${customerId}/remove/${productId}`
    );
  },

  /** Clear *all* items from the DB cart */
  clearCartDB: async (customerId) => {
    return requests.delete(`/customer/cart/${customerId}/clear`);
  },

  /** Update FCM token for push notifications */
  updateFcmToken: async (id, fcmToken) => {
    return requests.put(`/customer/update-fcm-token/${id}`, { fcmToken });
  }
};

export default CustomerServices;
