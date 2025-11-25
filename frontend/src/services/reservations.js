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
  // 사장님 예약 조회 (기본)
  async getOwnerReservations(ownerId) {
    if (!ownerId) {
      throw new Error("ownerId가 필요합니다.");
    }

    const response = await fetch(
      `${API_BASE_URL}/owners/${ownerId}/reservations`,
      {
        headers: buildHeaders(),
      }
    );
    return handleResponse(response);
  },

  // ⭐ 사장님 예약 조회 (노쇼 위험도 포함)
  async getOwnerReservationsWithRisk(ownerId) {
    if (!ownerId) {
      throw new Error("ownerId가 필요합니다.");
    }

    const response = await fetch(
      `${API_BASE_URL}/owners/${ownerId}/reservations/with-risk`,
      {
        headers: buildHeaders(),
      }
    );
    return handleResponse(response);
  },

  // 예약 상태 업데이트
  async updateReservationStatus(reservationId, updates) {
    if (!reservationId) {
      throw new Error("reservationId가 필요합니다.");
    }

    const response = await fetch(
      `${API_BASE_URL}/reservations/${reservationId}/status`,
      {
        method: "PATCH",
        headers: buildHeaders(),
        body: JSON.stringify(updates),
      }
    );
    return handleResponse(response);
  },

  // 예약 생성 (결제 포함)
  async createReservationWithPayment(reservationData) {
    const response = await fetch(
      `${API_BASE_URL}/reservations/full-pay`,
      {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(reservationData),
      }
    );
    return handleResponse(response);
  },

  // 예약 취소
  async cancelReservation(reservationId) {
    return this.updateReservationStatus(reservationId, {
      status: "CANCELLED",
      paymentStatus: "REFUND",
    });
  },

  // ⭐ 가게별 노쇼율 조회
  async getNoShowRate(businessId) {
    if (!businessId) {
      throw new Error("businessId가 필요합니다.");
    }

    const response = await fetch(
      `${API_BASE_URL}/businesses/${businessId}/noshow-rate`,
      {
        headers: buildHeaders(),
      }
    );
    return handleResponse(response);
  },

  // ⭐ 사장님의 모든 가게 노쇼율 조회
  async getOwnerNoShowRates(ownerId) {
    if (!ownerId) {
      throw new Error("ownerId가 필요합니다.");
    }

    const response = await fetch(
      `${API_BASE_URL}/owners/${ownerId}/noshow-rate`,
      {
        headers: buildHeaders(),
      }
    );
    return handleResponse(response);
  },

  // ⭐ 예약별 위험도 조회
  async getReservationRisk(reservationId) {
    if (!reservationId) {
      throw new Error("reservationId가 필요합니다.");
    }

    const response = await fetch(
      `${API_BASE_URL}/reservations/${reservationId}/risk`,
      {
        headers: buildHeaders(),
      }
    );
    return handleResponse(response);
  },
};

export default reservationAPI;
