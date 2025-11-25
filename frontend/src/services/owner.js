import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';

export const ownerAPI = {
  /**
   * 사업자 프로필 조회
   */
  async getOwnerProfile(ownerId) {
    const response = await axios.get(`${API_BASE_URL}/owners/${ownerId}`);
    return response.data;
  },

  /**
   * 사업자 정보 수정
   */
  async updateOwnerProfile(ownerId, data) {
    const response = await axios.put(`${API_BASE_URL}/owners/${ownerId}`, data);
    return response.data;
  },
};
