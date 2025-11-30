const API_BASE_URL = "/api/stores";

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || "요청 처리 중 오류가 발생했습니다.";
    throw new Error(message);
  }
  return data;
};

export const storeAPI = {
  // 내 주변 맛집 검색
  async getNearbyStores(lat, lng, radius = 5000) {
    const params = new URLSearchParams({ lat, lng, radius });
    const response = await fetch(`${API_BASE_URL}/nearby?${params.toString()}`);
    return handleResponse(response);
  },

  // 가게 상세 정보
  async getStoreDetail(storeId) {
    const response = await fetch(`${API_BASE_URL}/${storeId}`);
    return handleResponse(response);
  },

  // ⭐ 기존 일반 예약 API
  async createReservation(reservationData) {
    const response = await fetch("/api/reservations", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData),
    });
    return handleResponse(response);
  },

  // ⭐⭐ 추가된 모의 결제 포함 예약 API
  async fullPayReservation(reservationData) {
    console.log("🔵 [예약 생성] 노쇼 감지 ML 모델 실행 시작...", {
      businessId: reservationData.businessId,
      memberId: reservationData.memberId,
      people: reservationData.people,
      reservationTime: reservationData.reservationTime,
    });

    const response = await fetch("/api/reservations/full-pay", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(reservationData),
    });
    
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

  // 가게 메뉴 조회
  async getStoreMenus(storeId) {
    const response = await fetch(`${API_BASE_URL}/${storeId}/menus`);
    return handleResponse(response);
  },

  // 가게 리뷰 조회
  async getStoreReviews(storeId) {
    const response = await fetch(`${API_BASE_URL}/${storeId}/reviews`);
    return handleResponse(response);
  },
};

export default storeAPI;
