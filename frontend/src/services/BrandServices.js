import requests from "./httpServices";

const BrandServices = {
  getShowingBrands: async (homepage = false) => {
    try {
      const suffix = homepage ? "?homepage=true" : "";
      return await requests.get(`/brand/show${suffix}`);
    } catch {
      return [];
    }
  },
};

export default BrandServices;

