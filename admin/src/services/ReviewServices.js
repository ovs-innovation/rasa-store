import requests from "./httpService";

const ReviewServices = {
  getAllReviews: async ({
    page = 1,
    limit = 10,
    rating,
    productId,
    userId,
    verified,
    sort = "newest",
    search,
    invoice,
  }) => {
    const params = new URLSearchParams();
    if (page) params.append("page", page);
    if (limit) params.append("limit", limit);
    if (rating) params.append("rating", rating);
    if (productId) params.append("productId", productId);
    if (userId) params.append("userId", userId);
    if (verified !== undefined) params.append("verified", verified);
    if (sort) params.append("sort", sort);
    if (search) params.append("search", search);
    if (invoice) params.append("invoice", invoice);

    return requests.get(`/reviews/admin/all?${params.toString()}`);
  },

  deleteReview: async (reviewId) => {
    return requests.delete(`/reviews/${reviewId}`);
  },

  createReview: async (body) => {
    return requests.post("/reviews/admin", body);
  },

  updateReview: async (reviewId, body) => {
    return requests.put(`/reviews/admin/${reviewId}`, body);
  },
};

export default ReviewServices;

