import requests from "./httpServices";

const BrandServices = {
  getShowingBrands: async ({ homepage = false, category = "" } = {}) => {
    try {
      const params = new URLSearchParams();
      if (homepage) params.set("homepage", "true");
      if (category) params.set("category", category);
      const query = params.toString();
      return await requests.get(`/brand/show${query ? `?${query}` : ""}`);
    } catch {
      return [];
    }
  },
};

export default BrandServices;

