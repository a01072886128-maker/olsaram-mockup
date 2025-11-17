import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../../components/Navbar";
import Button from "../../components/Button";
import { useAuth } from "../../contexts/AuthContext";
import { businessAPI } from "../../services/business";

const categories = [
  "한식",
  "카페",
  "일식",
  "중식",
  "양식",
  "퓨전",
  "기타",
];

const initialFormState = {
  businessName: "",
  businessNumber: "",
  category: categories[0],
  address: "",
  phone: "",
  description: "",
  businessImageUrl: "",
  openingHours: '{ "mon": "09:00-18:00", "tue": "09:00-18:00", "wed": "09:00-18:00" }',
};

const RegisterBusiness = () => {
  const { user } = useAuth();
  const ownerId = user?.ownerId;
  const navigate = useNavigate();

  const [formState, setFormState] = useState(initialFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (event) => {
    const { name, value } = event.target;
    setFormState((prev) => ({ ...prev, [name]: value }));
    setErrorMessage("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!ownerId) {
      setErrorMessage("로그인한 사업자 정보가 없습니다. 다시 로그인해주세요.");
      return;
    }
    if (!formState.businessName.trim()) {
      setErrorMessage("가게 이름은 필수 항목입니다.");
      return;
    }

    const payload = {
      owner_id: ownerId,
      business_name: formState.businessName.trim(),
      business_number: formState.businessNumber.trim() || undefined,
      category: formState.category,
      address: formState.address.trim(),
      phone: formState.phone.trim(),
      description: formState.description.trim(),
      business_image_url: formState.businessImageUrl.trim(),
      opening_hours: formState.openingHours.trim(),
    };

    try {
      setIsSubmitting(true);
      await businessAPI.registerBusiness(payload);
      window.alert("가게 등록이 완료되었습니다.");
      navigate("/owner/dashboard", { replace: true });
    } catch (error) {
      const serverMessage =
        error?.response?.data?.message || error?.message || "가게 등록에 실패했습니다.";
      setErrorMessage(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userType="owner" />
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6 rounded-2xl bg-white p-8 shadow-lg">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">가게 등록하기</h1>
            <p className="mt-2 text-sm text-text-secondary">
              사업자 정보와 메뉴 정보를 기반으로 새 가게를 등록하면 대시보드에서 관리할 수 있습니다.
            </p>
          </div>

          {errorMessage && (
            <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {errorMessage}
            </div>
          )}

          <form className="grid gap-6" onSubmit={handleSubmit}>
            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">
                가게 이름<span className="ml-1 text-red-500">*</span>
              </label>
              <input
                name="businessName"
                value={formState.businessName}
                onChange={handleChange}
                required
                placeholder="예: 홍대 중국집"
                className="w-full rounded-lg border border-border-color px-4 py-3 text-sm shadow-sm focus:border-primary-green focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">
                사업자등록번호
              </label>
              <input
                name="businessNumber"
                value={formState.businessNumber}
                onChange={handleChange}
                placeholder="예: 123-45-67890"
                className="w-full rounded-lg border border-border-color px-4 py-3 text-sm shadow-sm focus:border-primary-green focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">
                카테고리
              </label>
              <select
                name="category"
                value={formState.category}
                onChange={handleChange}
                className="w-full rounded-lg border border-border-color px-4 py-3 text-sm shadow-sm focus:border-primary-green focus:outline-none"
              >
                {categories.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">
                주소
              </label>
              <input
                name="address"
                value={formState.address}
                onChange={handleChange}
                placeholder="예: 서울특별시 마포구 ..."
                className="w-full rounded-lg border border-border-color px-4 py-3 text-sm shadow-sm focus:border-primary-green focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">
                연락처
              </label>
              <input
                name="phone"
                value={formState.phone}
                onChange={handleChange}
                placeholder="예: 02-1234-5678"
                className="w-full rounded-lg border border-border-color px-4 py-3 text-sm shadow-sm focus:border-primary-green focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">
                간단 소개
              </label>
              <textarea
                name="description"
                value={formState.description}
                onChange={handleChange}
                rows={3}
                placeholder="새로운 메뉴나 분위기를 소개해보세요."
                className="w-full rounded-lg border border-border-color px-4 py-3 text-sm shadow-sm focus:border-primary-green focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">
                대표 이미지 URL
              </label>
              <input
                name="businessImageUrl"
                value={formState.businessImageUrl}
                onChange={handleChange}
                placeholder="https://"
                className="w-full rounded-lg border border-border-color px-4 py-3 text-sm shadow-sm focus:border-primary-green focus:outline-none"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-semibold text-text-secondary">
                오픈 시간(JSON)
              </label>
              <textarea
                name="openingHours"
                value={formState.openingHours}
                onChange={handleChange}
                rows={4}
                className="w-full rounded-lg border border-border-color px-4 py-3 text-sm font-mono leading-relaxed shadow-sm focus:border-primary-green focus:outline-none"
              />
            </div>

            <div className="mt-2 flex justify-end">
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "등록 중..." : "가게 등록하기"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default RegisterBusiness;
