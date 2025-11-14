import { useState } from 'react';
import { useNavigate, Navigate } from 'react-router-dom';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuth } from '../../contexts/AuthContext.jsx';

function CustomerLogin() {
  const navigate = useNavigate();
  const { login, status, error } = useAuth();

  const [userId, setUserId] = useState(() => import.meta.env.VITE_DEFAULT_LOGIN_ID ?? '');
  const [password, setPassword] = useState(
    () => import.meta.env.VITE_DEFAULT_LOGIN_PASSWORD ?? ''
  );
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (status === 'authenticated') {
    return <Navigate to="/customer/nearby" replace />;
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
      }, 'customer'); // 고객 타입으로 로그인

      // 고객으로 로그인하면 고객 페이지로 이동
      if (user && user.role) {
        const role = user.role.toLowerCase();

        if (role === 'user' || role === 'customer') {
          navigate('/customer/nearby', { replace: true });
        } else if (role === 'owner') {
          navigate('/owner/dashboard', { replace: true });
        } else if (role === 'admin') {
          navigate('/admin/fraud-detection', { replace: true });
        } else {
          // 기본적으로 고객 페이지로
          navigate('/customer/nearby', { replace: true });
        }
      } else {
        navigate('/customer/nearby', { replace: true });
      }
    } catch (err) {
      setFormError(err?.message ?? '로그인에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-slate-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <header className="text-center space-y-2">
          <div className="mb-4">
            <h1 className="text-3xl font-bold text-text-primary">고객 로그인</h1>
          </div>
          <p className="text-sm text-text-secondary">
            올사람에 오신 것을 환영합니다
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
            className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white"
            disabled={isSubmitting}
          >
            {isSubmitting ? '로그인 중...' : '로그인'}
          </Button>
        </form>

        <div className="text-center text-sm text-text-secondary">
          계정이 없으신가요?{' '}
          <a href="/auth/register" className="text-blue-600 font-semibold hover:underline">
            회원가입
          </a>
        </div>

        <div className="pt-4 border-t text-center">
          <p className="text-sm text-text-secondary mb-2">
            사장님이신가요?
          </p>
          <Button
            variant="outline"
            size="sm"
            className="border-primary-green text-primary-green hover:bg-primary-green/10"
            onClick={() => navigate('/auth/login')}
          >
            사장님 로그인
          </Button>
        </div>
      </div>
    </div>
  );
}

export default CustomerLogin;
