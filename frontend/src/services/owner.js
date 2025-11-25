import axios from "axios";

const envApiBase = import.meta.env?.VITE_API_BASE_URL?.trim();
const API_BASE_URL = envApiBase?.replace(/\/+$/, "") || "/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
};

export const ownerAPI = {
  /**
   * 사업자 프로필 조회
   */
  async getOwnerProfile(ownerId) {
    const response = await axios.get(`${API_BASE_URL}/owners/${ownerId}`, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return response.data;
  },

  /**
   * 사업자 정보 수정
   */
  async updateOwnerProfile(ownerId, data) {
    const response = await axios.put(`${API_BASE_URL}/owners/${ownerId}`, data, {
      headers: {
        ...getAuthHeaders(),
      },
    });
    return response.data;
  },
};
