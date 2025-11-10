// API 기본 설정 - Vite 프록시를 통해 요청
const API_BASE_URL = '/api';

// LocalStorage에서 토큰 가져오기
const getToken = () => {
  return localStorage.getItem('token');
};

// API 요청 헬퍼 함수
const apiRequest = async (endpoint, options = {}) => {
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  // 인증 토큰이 있으면 헤더에 추가
  if (token) {
    config.headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || '요청 처리 중 오류가 발생했습니다');
    }

    return data;
  } catch (error) {
    console.error('API 요청 오류:', error);
    throw error;
  }
};

// 인증 관련 API
export const authAPI = {
  // 회원가입
  register: async (userData) => {
    try {
      const fetchResponse = await fetch(`${API_BASE_URL}/business-owner/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      let data;
      try {
        data = await fetchResponse.json();
      } catch (e) {
        console.error('JSON 파싱 실패:', e, '응답:', fetchResponse);
        throw new Error('서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }

      // HTTP 상태 코드 확인
      if (!fetchResponse.ok) {
        throw new Error(data?.message || '회원가입에 실패했습니다.');
      }

      return data;
    } catch (error) {
      console.error('회원가입 오류:', error);
      throw error;
    }
  },

  // 로그인
  login: async (credentials) => {
    try {
      const fetchResponse = await fetch(`${API_BASE_URL}/business-owner/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      });

      let data;
      try {
        data = await fetchResponse.json();
      } catch (e) {
        console.error('JSON 파싱 실패:', e, '응답:', fetchResponse);
        throw new Error('서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.');
      }

      // HTTP 상태 코드 확인
      if (!fetchResponse.ok) {
        throw new Error(data?.message || '로그인에 실패했습니다.');
      }

      // 로그인 성공 - 토큰과 사용자 정보 저장
      if (data.data) {
        // 토큰이 있으면 저장
        if (data.data.token) {
          localStorage.setItem('token', data.data.token);
        }
        localStorage.setItem('user', JSON.stringify(data.data));
      }

      return data;
    } catch (error) {
      console.error('로그인 오류:', error);
      throw error;
    }
  },

  // 로그아웃
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  // 현재 사용자 정보 조회
  getMe: async () => {
    return await apiRequest('/auth/me');
  },

  // 현재 로그인 상태 확인
  isAuthenticated: () => {
    return !!getToken();
  },

  // 저장된 사용자 정보 가져오기
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },
};

export default authAPI;
