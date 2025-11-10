import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext.jsx';

function OwnerLogin() {
  const navigate = useNavigate();
  const { login, status, error } = useAuth();

  const [userId, setUserId] = useState(() => import.meta.env.VITE_DEFAULT_LOGIN_ID ?? '');
  const [password, setPassword] = useState(
    () => import.meta.env.VITE_DEFAULT_LOGIN_PASSWORD ?? ''
  );
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to="/owner/dashboard" replace />;
  }

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    if (!userId || !password) {
      setFormError('아이디와 비밀번호를 모두 입력해 주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await login({
        loginId: userId,
        password,
      });

      // 사장님 로그인이므로 owner 대시보드로 이동
      navigate('/owner/dashboard', { replace: true });
    } catch (err) {
      setFormError(err?.message ?? '로그인에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">로그인</h1>
          <p className="text-sm text-text-secondary">
            아이디와 비밀번호를 입력해 주세요.
          </p>
        </header>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="userId">
              아이디
            </label>
            <Input
              id="userId"
              name="userId"
              autoComplete="username"
              placeholder="아이디를 입력하세요"
              value={userId}
              onChange={(event) => setUserId(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="password">
              비밀번호
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              placeholder="비밀번호를 입력하세요"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              disabled={isSubmitting}
            />
          </div>

          {(formError || error) && (
            <p className="text-sm text-red-500">
              {formError || error?.message || '로그인 중 오류가 발생했습니다.'}
            </p>
          )}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="text-center text-sm text-text-secondary">
          계정이 없으신가요?{' '}
          <a href="/auth/register" className="text-primary-green font-semibold hover:underline">
            회원가입
          </a>
        </div>
      </div>
    </div>
  );
}

export default OwnerLogin;
