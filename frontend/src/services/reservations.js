const envApiBase = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = envApiBase?.replace(/\/$/, "") || "/api";

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || "예약 정보를 불러오지 못했습니다.";
    throw new Error(message);
  }
  return data;
};

const buildHeaders = () => {
  const token = localStorage.getItem("token");
  if (token) {
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }
  return {
    "Content-Type": "application/json",
  };
};

export const reservationAPI = {
  async getOwnerReservations(ownerId) {
    if (!ownerId) {
      throw new Error("ownerId가 필요합니다.");
    }

    // 🔥 백엔드 엔드포인트 맞게 수정
    const response = await fetch(
      `${API_BASE_URL}/reservations/owner/${ownerId}`,
      {
        headers: buildHeaders(),
      }
    );
    return handleResponse(response);
  },

  async getOwnerReservations(ownerId) {
    if (!ownerId) {
      throw new Error("ownerId가 필요합니다.");
    }

    const response = await fetch(
      `${API_BASE_URL}/owners/${ownerId}/reservations`, // ✅ 백엔드 실제 URL
      {
        headers: buildHeaders(),
      }
    );
    return handleResponse(response);
  },
};

export default reservationAPI;
