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

  // 가게 삭제
  async deleteBusiness(businessId, ownerId) {
    const response = await axios.delete(`${endpoint}/${businessId}`, {
      params: { ownerId }
    });
    return response.data;
  },

  // 가게 단일 조회
  async getBusinessById(businessId) {
    const response = await axios.get(`${endpoint}/${businessId}`);
    return response.data;
  },

  // 가게 정보 수정
  async updateBusiness(businessId, ownerId, payload) {
    const response = await axios.put(`${endpoint}/${businessId}`, payload, {
      params: { ownerId }
    });
    return response.data;
  },
};
