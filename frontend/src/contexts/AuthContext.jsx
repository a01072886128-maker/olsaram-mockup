import { createContext, useContext, useEffect, useMemo, useState, useCallback } from 'react';
import authAPI from '../services/api';

const AuthContext = createContext(null);

const extractUser = (response) => {
  if (!response) {
    return null;
  }

  if (response.user) {
    return response.user;
  }

  if (response.data) {
    if (response.data.user) {
      return response.data.user;
    }

    return response.data;
  }

  return response;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authAPI.getCurrentUser());
  const [status, setStatus] = useState(() => {
    const hasSession = authAPI.isAuthenticated();
    const storedUser = authAPI.getCurrentUser();
    if (hasSession && storedUser) {
      return 'authenticated';
    }

    return 'idle';
  });
  const [error, setError] = useState(null);

  const login = useCallback(
    async (credentials) => {
      try {
        setStatus('loading');
        setError(null);

        const response = await authAPI.login(credentials);
        const nextUser = extractUser(response) ?? authAPI.getCurrentUser();

        setUser(nextUser ?? null);
        setStatus('authenticated');

        return nextUser;
      } catch (err) {
        console.error('로그인 실패:', err);
        setError(err);
        setStatus('idle');
        throw err;
      }
    },
    [setStatus, setError, setUser]
  );

  useEffect(() => {
    if (status === 'authenticated' && user) {
      return;
    }

    const hasToken = authAPI.isAuthenticated();
    const storedUser = authAPI.getCurrentUser();

    if (hasToken && storedUser) {
      setUser(storedUser);
      setStatus('authenticated');
    } else if (!hasToken && status !== 'idle') {
      setStatus('idle');
    }
  }, [status, user, setUser, setStatus]);

  const logout = useCallback(() => {
    authAPI.logout();
    setUser(null);
    setStatus('idle');
    setError(null);
  }, [setUser, setStatus, setError]);

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
    throw new Error('useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.');
  }

  return context;
}
