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
    console.log("🔵 [예약 생성] 노쇼 감지 ML 모델 실행 시작...", {
      businessId: reservationData.businessId,
      memberId: reservationData.memberId,
      people: reservationData.people,
      reservationTime: reservationData.reservationTime,
    });

    const response = await fetch(
      `${API_BASE_URL}/reservations/full-pay`,
      {
        method: "POST",
        headers: buildHeaders(),
        body: JSON.stringify(reservationData),
      }
    );
    
    const result = await handleResponse(response);
    
    // ⭐ ML 모델은 필수로 사용되므로 항상 성공해야 함
    if (result.mlModelUsed && result.mlModelResult === "SUCCESS") {
      console.log("✅ [ML 모델 성공] 노쇼 감지 ML 모델이 성공적으로 적용되었습니다.", {
        예약ID: result.reservationId,
        ML위험도레벨: result.mlModelRiskLevel,
        ML위험도퍼센트: result.mlModelRiskPercent + "%",
        최종위험도점수: result.riskScore,
        최종위험도레벨: result.riskLevel,
        계산된예약금: result.chargedAmount + "원",
        적용수수료율: result.appliedFeePercent + "%",
      });
    } else {
      console.error("❌ [ML 모델 실패] 노쇼 감지 ML 모델 적용에 실패했습니다. 예약이 생성되지 않았습니다.", {
        예약ID: result.reservationId,
        ML모델사용여부: result.mlModelUsed,
        ML모델결과: result.mlModelResult,
      });
    }

    return result;
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
