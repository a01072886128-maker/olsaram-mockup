import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import authAPI from '../../services/api';

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    userId: '',
    password: '',
    passwordConfirm: '',
    name: '',
    phone: '',
    email: '',
    businessNumber: '',
    role: 'user', // 기본값: 고객
  });

  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError('');

    // 유효성 검사
    if (!formData.userId || !formData.password || !formData.name) {
      setFormError('필수 항목을 모두 입력해 주세요.');
      return;
    }

    if (formData.password !== formData.passwordConfirm) {
      setFormError('비밀번호가 일치하지 않습니다.');
      return;
    }

    // 비밀번호 숫자 4자리 검증
    if (!/^\d{4}$/.test(formData.password)) {
      setFormError('비밀번호는 숫자 4자리여야 합니다.');
      return;
    }

    setIsSubmitting(true);

    try {
      const registerData = {
        loginId: formData.userId,
        password: formData.password,
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
      };

      // 사업자인 경우에만 사업자등록번호 추가
      if (formData.role === 'owner') {
        registerData.businessNumber = formData.businessNumber;
      }

      // 사용자 유형에 따라 올바른 엔드포인트로 API 호출
      const response = await authAPI.register(registerData, formData.role);

      if (response.success) {
        alert('회원가입이 완료되었습니다!');
        navigate('/auth/login', { replace: true });
      } else {
        setFormError(response.message || '회원가입에 실패했습니다.');
      }
    } catch (err) {
      setFormError(err?.message ?? '회원가입에 실패했습니다. 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-lime-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md bg-white shadow-xl rounded-2xl p-8 space-y-6">
        <header className="text-center space-y-2">
          <h1 className="text-3xl font-bold text-text-primary">회원가입</h1>
          <p className="text-sm text-text-secondary">
            올사람에 가입하고 약속을 지키는 문화를 만들어요
          </p>
        </header>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="role">
              회원 유형
            </label>
            <div className="relative">
              <ChevronDown className="pointer-events-none absolute right-6 top-1/2 -translate-y-1/2 h-4 w-4 text-primary-green" />
              <select
                id="role"
                name="role"
                value={formData.role}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full appearance-none rounded-xl border border-border-color bg-white pl-4 pr-12 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-green"
              >
                <option value="user">고객</option>
                <option value="owner">사장님</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="userId">
              아이디 <span className="text-red-500">*</span>
            </label>
            <Input
              id="userId"
              name="userId"
              placeholder="아이디를 입력하세요"
              value={formData.userId}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="password">
              비밀번호 <span className="text-red-500">*</span>
            </label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={formData.password}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <label
              className="text-sm font-medium text-text-primary"
              htmlFor="passwordConfirm"
            >
              비밀번호 확인 <span className="text-red-500">*</span>
            </label>
            <Input
              id="passwordConfirm"
              name="passwordConfirm"
              type="password"
              placeholder="비밀번호를 다시 입력하세요"
              value={formData.passwordConfirm}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          {formData.role === 'owner' && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-text-primary" htmlFor="businessNumber">
                사업자등록번호 <span className="text-red-500">*</span>
              </label>
              <Input
                id="businessNumber"
                name="businessNumber"
                placeholder="123-45-67890"
                value={formData.businessNumber}
                onChange={handleChange}
                disabled={isSubmitting}
                required={formData.role === 'owner'}
              />
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="name">
              이름 <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              name="name"
              placeholder="이름을 입력하세요"
              value={formData.name}
              onChange={handleChange}
              disabled={isSubmitting}
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="phone">
              전화번호
            </label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              placeholder="010-0000-0000"
              value={formData.phone}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-text-primary" htmlFor="email">
              이메일
            </label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="example@email.com"
              value={formData.email}
              onChange={handleChange}
              disabled={isSubmitting}
            />
          </div>

          {formError && <p className="text-sm text-red-500">{formError}</p>}

          <Button
            type="submit"
            className="w-full h-12 text-base font-semibold"
            disabled={isSubmitting}
          >
            {isSubmitting ? '가입 중...' : '회원가입'}
          </Button>
        </form>

        <div className="text-center text-sm text-text-secondary">
          이미 계정이 있으신가요?{' '}
          <Link to="/auth/login" className="text-primary-green font-semibold hover:underline">
            로그인
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Register;
