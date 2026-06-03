import requests from "./httpServices";

const CustomerNotificationServices = {
  getMyNotifications: async (params = {}) => {
    const query = new URLSearchParams(params).toString();
    const url = query
      ? `/customer-notifications?${query}`
      : "/customer-notifications";
    return requests.get(url);
  },

  getUnreadCount: async () => {
    return requests.get("/customer-notifications/unread-count");
  },

  markAsRead: async (id) => {
    return requests.put(`/customer-notifications/${id}/read`);
  },

  markAllAsRead: async () => {
    return requests.put("/customer-notifications/read-all");
  },

  getById: async (id) => {
    return requests.get(`/customer-notifications/${id}`);
  },

  deleteNotification: async (id) => {
    return requests.delete(`/customer-notifications/${id}`);
  },

  getPublicAnnouncements: async (limit = 5) => {
    return requests.get(`/customer-notifications/announcements?limit=${limit}`);
  },
};

export default CustomerNotificationServices;
