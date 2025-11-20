import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import authAPI from "../services/api";

const AuthContext = createContext(null);

// 🔥 user 데이터 정규화
const normalizeUser = (raw) => {
  if (!raw) return null;

  return {
    token: raw.token ?? null,
    ownerId: raw.ownerId ?? null,
    customerId: raw.customerId ?? null,
    name: raw.name ?? null,
    email: raw.email ?? null,
    role: raw.role ?? null,
    _raw: raw,
  };
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = authAPI.getCurrentUser();
    return stored ? normalizeUser(stored) : null;
  });

  const [status, setStatus] = useState(() => {
    const hasToken = authAPI.isAuthenticated();
    return hasToken ? "authenticated" : "idle";
  });

  const [error, setError] = useState(null);

  // -------------------------------------------------
  // 🔑 로그인
  // -------------------------------------------------
  const login = useCallback(async (credentials, userType = "owner") => {
    try {
      setStatus("loading");
      setError(null);

      const response = await authAPI.login(credentials, userType);

      // 로그인 성공 후 user 는 localStorage에 이미 저장됨
      const stored = authAPI.getCurrentUser();
      const normalized = normalizeUser(stored);

      setUser(normalized);
      setStatus("authenticated");

      return normalized;
    } catch (err) {
      console.error("로그인 실패:", err);
      setError(err);
      setStatus("idle");
      throw err;
    }
  }, []);

  // -------------------------------------------------
  // 🔄 새로고침 시 자동 로그인 유지
  // -------------------------------------------------
  useEffect(() => {
    const stored = authAPI.getCurrentUser();
    if (stored) {
      setUser(normalizeUser(stored));
      setStatus("authenticated");
    }
  }, []);

  // -------------------------------------------------
  // 🚪 로그아웃
  // -------------------------------------------------
  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    setStatus("idle");
    setError(null);
  }, []);

  // -------------------------------------------------
  // Context Value
  // -------------------------------------------------
  const value = useMemo(
    () => ({
      user,
      status,
      error,
      login,
      logout,
    }),
    [user, status, error, login, logout]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용 가능합니다.");
  }
  return context;
}
