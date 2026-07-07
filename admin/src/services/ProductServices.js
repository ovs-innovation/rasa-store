import requests from "./httpService";

const ProductServices = {
  getAllProducts: async ({
    page,
    limit,
    category,
    title,
    price,
    brand,
    status,
  }) => {
    const searchCategory = category || "";
    const searchTitle = title || "";
    const searchPrice = price || "";
    const searchBrand = brand || "";
    const searchStatus = status || "";

    return requests.get(
      `/products?page=${page}&limit=${limit}&category=${searchCategory}&title=${searchTitle}&price=${searchPrice}&brand=${searchBrand}&status=${searchStatus}`
    );
  },

  getProductById: async (id) => {
    return requests.post(`/products/${id}`);
  },
  addProduct: async (body) => {
    return requests.post("/products/add", body);
  },
  addAllProducts: async (body) => {
    return requests.post("/products/all", body);
  },
  updateProduct: async (id, body) => {
    return requests.patch(`/products/${id}`, body);
  },
  updateProductStock: async (id, stock) => {
    return requests.patch(`/products/${id}/stock`, { stock });
  },
  updateManyProducts: async (body) => {
    return requests.patch("/products/update/many", body);
  },
  updateStatus: async (id, body) => {
    return requests.put(`/products/status/${id}`, body);
  },

  deleteProduct: async (id) => {
    return requests.delete(`/products/${id}`);
  },
  deleteManyProducts: async (body) => {
    return requests.patch("/products/delete/many", body);
  },

  exportProductsCSV: async ({ type, startDate, endDate, startId, endId }) => {
    return requests.get(
      `/products/export/csv?type=${type}&startDate=${startDate}&endDate=${endDate}&startId=${startId}&endId=${endId}`
    );
  },

  importProductsCSV: async (body) => {
    return requests.post("/products/import/csv", body);
  },

};

export default ProductServices;
