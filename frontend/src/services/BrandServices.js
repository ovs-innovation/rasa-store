import requests from "./httpServices";

const BrandServices = {
  getShowingBrands: async () => {
    try {
      return await requests.get("/brand/show");
    } catch {
      return [];
    }
  },
};

export default BrandServices;

