import requests from "./httpService";

const CustomerServices = {
  getAllCustomers: async ({ searchText = "", filterType = "" }) => {
    const params = new URLSearchParams();
    if (searchText) params.append("searchText", searchText);
    if (filterType) params.append("filterType", filterType);
    return requests.get(`/customer?${params.toString()}`);
  },

  addAllCustomers: async (body) => {
    return requests.post("/customer/add/all", body);
  },
  // user create
  createCustomer: async (body) => {
    return requests.post(`/customer/create`, body);
  },

  filterCustomer: async (email) => {
    return requests.post(`/customer/filter/${email}`);
  },

  getCustomerById: async (id) => {
    return requests.get(`/customer/${id}`);
  },

  updateCustomer: async (id, body) => {
    return requests.put(`/customer/${id}`, body);
  },

  deleteCustomer: async (id) => {
    return requests.delete(`/customer/${id}`);
  },

  deleteCloudinaryAsset: async (publicId) => {
    return requests.post(`/customer/cloudinary-delete`, { publicId });
  },

  getCustomerStatistics: async () => {
    return requests.get("/customer/statistics");
  },

  // Shipping Address APIs
  getShippingAddresses: async (customerId) => {
    return requests.get(`/customer/shipping/address/${customerId}`);
  },

  addShippingAddress: async (customerId, body) => {
    return requests.post(`/customer/shipping/address/${customerId}`, body);
  },

  updateShippingAddress: async (customerId, addressId, body) => {
    return requests.put(`/customer/shipping/address/${customerId}/${addressId}`, body);
  },

  deleteShippingAddress: async (customerId, addressId) => {
    return requests.delete(`/customer/shipping/address/${customerId}/${addressId}`);
  },

  updateFcmToken: async (id, fcmToken) => {
    return requests.put(`/customer/update-fcm-token/${id}`, { fcmToken });
  },
};

export default CustomerServices;
