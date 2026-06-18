import requests from "./httpServices";
import { transformProduct, transformProductList, transformStoreData } from "@utils/fashionMap";

const emptyStore = {
  products: [],
  popularProducts: [],
  discountedProducts: [],
  bestSellingProducts: [],
  relatedProducts: [],
};

const ProductServices = {
  getShowingProducts: async () => {
    const res = await requests.get("/products/show");
    return transformProductList(res || []);
  },

  getShowingStoreProducts: async ({
    category = "",
    title = "",
    slug = "",
    brand = "",
  } = {}) => {
    const res = await requests.get(
      `/products/store?category=${category}&title=${title}&slug=${slug}&brand=${brand}`
    );
    return transformStoreData(res || emptyStore);
  },

  getDiscountedProducts: async () => {
    const res = await requests.get("/products/store");
    const list = res?.discountedProducts || [];
    return transformProductList(list);
  },

  getProductBySlug: async (slug) => {
    const res = await requests.get(`/products/product/${slug}`);
    return transformProduct(res);
  },

  addProductView: async (body) => {
    return requests.post("/products/view", body);
  },

  getSuggestedProducts: async ({ productIds } = {}) => {
    const queryString = productIds ? `?productIds=${productIds}` : "";
    const res = await requests.get(`/products/suggested${queryString}`);
    return transformProductList(res || []);
  },
};

export default ProductServices;
