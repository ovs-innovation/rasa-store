import requests from "./httpServices";

const CategoryServices = {
  getShowingCategory: async () => {
    const res = await requests.get("/category/show");
    return Array.isArray(res) ? res : [];
  },
  getAllCategories: async () => {
    const res = await requests.get("/category/all");
    return Array.isArray(res) ? res : [];
  },
};

export default CategoryServices;
