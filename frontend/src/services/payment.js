const envApiBase = import.meta.env.VITE_API_BASE_URL?.trim();
const API_BASE_URL = envApiBase?.replace(/\/$/, "") || "/api";

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

const handleResponse = async (response) => {
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = data?.message || "결제 처리 중 오류가 발생했습니다.";
    throw new Error(message);
  }
  return data;
};

export const paymentAPI = {
  /**
   * 토스 페이먼츠 결제 주문 생성
   */
  async createTossPaymentOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/payments/toss/order`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(orderData),
    });
    return handleResponse(response);
  },

  /**
   * 토스 페이먼츠 결제 승인
   */
  async confirmTossPayment(paymentData) {
    const response = await fetch(`${API_BASE_URL}/payments/toss/confirm`, {
      method: "POST",
      headers: buildHeaders(),
      body: JSON.stringify(paymentData),
    });
    return handleResponse(response);
  },
};

export default paymentAPI;

