// ------------------------------------------
// API 기본 설정
// ------------------------------------------
const rawEnvApiBase =
  typeof import.meta !== "undefined"
    ? import.meta.env?.VITE_API_BASE_URL?.trim()
    : "";
const API_BASE_URL = rawEnvApiBase
  ? rawEnvApiBase.replace(/\/+$/, "")
  : "";

// LocalStorage에서 토큰 가져오기
const getToken = () => {
  return localStorage.getItem("token");
};

// 공통 요청 함수
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  if (token) {
    config.headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.message || "요청 처리 중 오류가 발생했습니다");
    }

    return data;
  } catch (error) {
    console.error("API 요청 오류:", error);
    throw error;
  }
};

// ------------------------------------------
// 🔥 user 데이터 정규화
// ------------------------------------------
const normalizeUser = (data, userType) => {
  if (!data) return null;

  // 고객: customerId, 사장님: ownerId
  const customerId = data.customerId ?? data.customer_id ?? null;
  const ownerId = data.ownerId ?? data.owner_id ?? null;

  return {
    token: data.token ?? null,
    customerId: customerId,
    ownerId: ownerId,
    name: data.name ?? data.username ?? null,
    email: data.email ?? null,
    phone: data.phone ?? null,
    role: userType,
    _raw: data,
  };
};

// ------------------------------------------
// 인증 API
// ------------------------------------------
export const authAPI = {
  // 회원가입
  register: async (userData, userType = "owner") => {
    try {
      const endpoint =
        userType === "owner"
          ? `/api/business-owner/auth/register`
          : `/api/customer/auth/register`;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data?.message || "회원가입에 실패했습니다.");
      }

      return data;
    } catch (error) {
      console.error("회원가입 오류:", error);
      throw error;
    }
  },

  // 로그인
  login: async (credentials, userType = "owner") => {
    try {
      // ⚙️ 환경에 따라 다른 베이스 URL을 쓰기 때문에 경로만 정의
      const endpoint =
        userType === "owner"
          ? `/api/business-owner/auth/login`
          : `/api/customer/auth/login`;

      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(credentials),
      });

      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(result?.message || "로그인에 실패했습니다.");
      }

      const rawUser = result.data;
      const normalized = normalizeUser(rawUser, userType);

      // 토큰 저장
      if (normalized.token) {
        localStorage.setItem("token", normalized.token);
      }

      // 유저 저장
      localStorage.setItem("user", JSON.stringify(normalized));

      return normalized;
    } catch (error) {
      console.error("로그인 오류:", error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },

  getMe: async () => {
    return await apiRequest("/api/auth/me");
  },

  isAuthenticated: () => {
    const hasToken = !!getToken();
    const hasUser = !!localStorage.getItem("user");
    return hasToken || hasUser;
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authAPI;
