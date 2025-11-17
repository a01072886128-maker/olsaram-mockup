import axios from "axios";

const endpoint = "/api/business";

export const businessAPI = {
  registerBusiness(payload) {
    return axios.post(endpoint, payload);
  },
};
