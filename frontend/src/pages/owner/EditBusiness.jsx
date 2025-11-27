import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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
  "일반음식점",
  "기타",
];

const EditBusiness = () => {
  const { user } = useAuth();
  const ownerId = user?.ownerId;
  const navigate = useNavigate();
  const { businessId } = useParams();

  const [formState, setFormState] = useState({
    businessName: "",
    businessNumber: "",
    category: "",
    address: "",
    phone: "",
    reservationFeeAmount: "",
    description: "",
    businessImageUrl: "",
    openingHours: "",
  });
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // 기존 가게 정보 불러오기
  useEffect(() => {
    if (!businessId) return;

    businessAPI
      .getBusinessById(businessId)
      .then((data) => {
        const reservationFeeAmount =
          data.reservationFeeAmount ??
          data.reservationFee ??
          data.reservation_fee_amount ??
          data.reservation_fee ??
          "";

        setFormState({
          businessName: data.businessName || "",
          businessNumber: data.businessNumber || "",
          category: data.category || "기타",
          address: data.address || "",
          phone: data.phone || "",
          reservationFeeAmount:
            reservationFeeAmount === 0 || reservationFeeAmount
              ? String(reservationFeeAmount)
              : "",
          description: data.description || "",
          businessImageUrl: data.businessImageUrl || "",
          openingHours: data.openingHours || "",
        });
        setLoading(false);
      })
      .catch((err) => {
        console.error("가게 정보 조회 실패:", err);
        setErrorMessage("가게 정보를 불러오는데 실패했습니다.");
        setLoading(false);
      });
  }, [businessId]);

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

    const reservationFeeInput = formState.reservationFeeAmount.trim();
    const reservationFeeAmount =
      reservationFeeInput === "" ? undefined : Number(reservationFeeInput);

    if (
      reservationFeeInput &&
      (Number.isNaN(reservationFeeAmount) || reservationFeeAmount < 0)
    ) {
      setErrorMessage("예약 수수료는 0원 이상 금액으로 입력해주세요.");
      return;
    }

    const payload = {
      owner_id: ownerId,
      business_name: formState.businessName.trim(),
      business_number: formState.businessNumber.trim(),
      category: formState.category,
      address: formState.address.trim(),
      phone: formState.phone.trim(),
      reservation_fee_amount: reservationFeeAmount,
      description: formState.description.trim(),
      business_image_url: formState.businessImageUrl.trim(),
      opening_hours: formState.openingHours.trim(),
    };

    try {
      setIsSubmitting(true);
      await businessAPI.updateBusiness(businessId, ownerId, payload);
      alert("가게 정보가 수정되었습니다.");
      navigate("/owner/my-businesses", { replace: true });
    } catch (error) {
      const serverMessage =
        error?.response?.data || error?.message || "가게 수정에 실패했습니다.";
      setErrorMessage(serverMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50">
        <Navbar userType="owner" />
        <main className="px-4 py-10">
          <div className="text-center text-text-secondary">
            가게 정보를 불러오는 중...
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar userType="owner" />
      <main className="px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-3xl space-y-6 rounded-2xl bg-white p-8 shadow-lg">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">가게 정보 수정</h1>
            <p className="mt-2 text-sm text-text-secondary">
              가게 정보를 수정하고 저장하세요.
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
                예약 수수료 기본 금액 (1인 기준)
              </label>
              <input
                type="number"
                name="reservationFeeAmount"
                min="0"
                step="100"
                inputMode="decimal"
                value={formState.reservationFeeAmount}
                onChange={handleChange}
                placeholder="예: 5000"
                className="w-full rounded-lg border border-border-color px-4 py-3 text-sm shadow-sm focus:border-primary-green focus:outline-none"
              />
              <p className="mt-1 text-xs text-text-secondary">
                위험도 구간에 따른 0~40% 수수료율이 적용되며, 인원 수만큼 곱해집니다.
              </p>
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
                placeholder='{ "mon": "09:00-18:00", "tue": "09:00-18:00" }'
                className="w-full rounded-lg border border-border-color px-4 py-3 text-sm font-mono leading-relaxed shadow-sm focus:border-primary-green focus:outline-none"
              />
            </div>

            <div className="mt-2 flex gap-3">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => navigate("/owner/my-businesses")}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? "저장 중..." : "변경사항 저장"}
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
};

export default EditBusiness;
