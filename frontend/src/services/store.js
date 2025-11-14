const API_BASE_URL = '/api/stores';

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || '요청 처리 중 오류가 발생했습니다.';
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

  // 예약 생성
  async createReservation(reservationData) {
    const response = await fetch('/api/reservations', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(reservationData),
    });
    return handleResponse(response);
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
