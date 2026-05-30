import requests from "./httpServices";

const AttributeServices = {
  getAllAttributes: async () => {
    return requests.get("/attributes");
  },

  getShowingAttributes: async () => {
    try {
      return await requests.get(`/attributes/show`);
    } catch {
      return [];
    }
  },

  getAttributeById: async (id) => {
    return requests.get(`/attributes/${id}`);
  },
};

export default AttributeServices;
