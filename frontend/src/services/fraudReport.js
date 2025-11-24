import axios from "axios";

const API_BASE_URL = "/api/fraud-reports";

export const fraudReportAPI = {
  /**
   * 신고 등록
   */
  async createReport(data) {
    const response = await axios.post(API_BASE_URL, data);
    return response.data;
  },

  /**
   * 전화번호 조회
   */
  async searchByPhone(phone) {
    const response = await axios.get(`${API_BASE_URL}/search`, {
      params: { phone },
    });
    return response.data;
  },

  /**
   * 신고 목록 조회
   * @param {Object} params - { sortBy, filterType, filterRegion, days }
   */
  async getReports(params = {}) {
    const response = await axios.get(API_BASE_URL, { params });
    return response.data;
  },

  /**
   * 신고 상세 조회
   */
  async getReportDetail(id) {
    const response = await axios.get(`${API_BASE_URL}/${id}`);
    return response.data;
  },

  /**
   * 추가 신고 (나도 피해입니다)
   */
  async addReport(data) {
    const response = await axios.post(`${API_BASE_URL}/add`, data);
    return response.data;
  },
};

// 전화번호 자동 포맷팅 유틸
export const formatPhoneNumber = (value) => {
  if (!value) return "";

  // 숫자만 추출
  const numbers = value.replace(/\D/g, "");

  // 010-1234-5678 형식으로 포맷
  if (numbers.length <= 3) {
    return numbers;
  } else if (numbers.length <= 7) {
    return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  } else {
    return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7, 11)}`;
  }
};

// 신고 유형 라벨
export const REPORT_TYPE_OPTIONS = [
  { value: "NO_SHOW", label: "노쇼", icon: "🚫" },
  { value: "RESERVATION_FRAUD", label: "예약 사기", icon: "🚨" },
  { value: "MARKETING_SPAM", label: "마케팅 스팸", icon: "📢" },
];

// 위험도 색상
export const getSeverityColor = (level) => {
  switch (level) {
    case "URGENT":
      return { bg: "bg-red-100", text: "text-red-600", border: "border-red-400" };
    case "WARNING":
      return { bg: "bg-orange-100", text: "text-orange-600", border: "border-orange-400" };
    default:
      return { bg: "bg-green-100", text: "text-green-600", border: "border-green-400" };
  }
};

// 금액 포맷팅
export const formatCurrency = (amount) => {
  if (!amount) return "0원";

  if (amount >= 10000) {
    return `${Math.floor(amount / 10000)}만${amount % 10000 > 0 ? amount % 10000 : ""}원`;
  }
  return `${amount.toLocaleString()}원`;
};

export default fraudReportAPI;
