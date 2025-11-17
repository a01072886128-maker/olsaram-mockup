import axios from "axios";

const endpoint = "/api/business";

export const businessAPI = {
  // 가게 등록
  registerBusiness(payload) {
    return axios.post(endpoint, payload);
  },

  // 사업자의 가게 목록 조회
  async getBusinessesByOwner(ownerId) {
    const response = await axios.get(`/api/owner/businesses`, {
      params: { ownerId }
    });
    return response.data;
  },
};
