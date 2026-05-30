import requests from "./httpServices";

const RefundServices = {
  getRefundData: async () => {
    return requests.get("/refund/all");
  },
};

export default RefundServices;
