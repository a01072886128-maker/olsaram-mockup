import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storeAPI } from "../../services/store";
import { useAuth } from "../../contexts/AuthContext";
import { Calendar, Users, Clock, CreditCard } from "lucide-react";
import Navbar from "../../components/Navbar";

export default function StoreReserve() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  // 로그인된 고객 ID 사용
  const customerId = user?.customerId;

  const [store, setStore] = useState(null);
  const [reservationDate, setReservationDate] = useState("");
  const [reservationTime, setReservationTime] = useState("");
  const [people, setPeople] = useState(2);
  const [paymentMethod, setPaymentMethod] = useState("CARD");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 가게 정보 불러오기
  useEffect(() => {
    const fetchStore = async () => {
      try {
        const data = await storeAPI.getStoreDetail(storeId);
        setStore(data);
      } catch (err) {
        console.error("가게 정보 로드 실패:", err);
      }
    };
    fetchStore();
  }, [storeId]);

  // 오늘 날짜 기본값 설정
  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    setReservationDate(today);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!customerId) {
      alert("로그인이 필요합니다.");
      navigate("/auth/customer-login");
      return;
    }

    if (!reservationDate || !reservationTime) {
      alert("날짜와 시간을 선택해주세요.");
      return;
    }

    setIsSubmitting(true);

    // ISO 형식으로 변환: "2025-11-23T19:00"
    const reservationDateTime = `${reservationDate}T${reservationTime}`;

    const data = {
      memberId: customerId,
      businessId: Number(storeId),
      people: people,
      reservationTime: reservationDateTime,
      paymentMethod: paymentMethod,
    };

    try {
      // 결제 포함 예약 API 호출
      await storeAPI.fullPayReservation(data);
      alert("예약이 완료되었습니다!");
      navigate("/customer/nearby");
    } catch (err) {
      alert("예약 중 오류 발생: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // 시간 옵션 생성 (11:00 ~ 21:00)
  const timeOptions = [];
  for (let h = 11; h <= 21; h++) {
    timeOptions.push(`${h.toString().padStart(2, "0")}:00`);
    if (h < 21) {
      timeOptions.push(`${h.toString().padStart(2, "0")}:30`);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar userType="customer" />

      <main className="max-w-xl mx-auto px-4 py-6">
        {/* 가게 정보 */}
        {store && (
          <div className="bg-white rounded-xl p-4 mb-6 shadow-sm">
            <h2 className="text-xl font-bold text-gray-900">
              {store.businessName}
            </h2>
            <p className="text-sm text-gray-500 mt-1">{store.address}</p>
          </div>
        )}

        {/* 예약 폼 */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* 날짜 선택 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Calendar className="w-4 h-4 mr-2 text-green-600" />
              예약 날짜
            </label>
            <input
              type="date"
              className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={reservationDate}
              onChange={(e) => setReservationDate(e.target.value)}
              min={new Date().toISOString().slice(0, 10)}
              required
            />
          </div>

          {/* 시간 선택 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Clock className="w-4 h-4 mr-2 text-green-600" />
              예약 시간
            </label>
            <select
              className="w-full border border-gray-300 rounded-lg p-3 text-base focus:ring-2 focus:ring-green-500 focus:border-green-500"
              value={reservationTime}
              onChange={(e) => setReservationTime(e.target.value)}
              required
            >
              <option value="">시간을 선택하세요</option>
              {timeOptions.map((time) => (
                <option key={time} value={time}>
                  {time}
                </option>
              ))}
            </select>
          </div>

          {/* 인원 선택 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <Users className="w-4 h-4 mr-2 text-green-600" />
              예약 인원
            </label>
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => setPeople((p) => Math.max(1, p - 1))}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
              >
                -
              </button>
              <span className="text-2xl font-bold text-gray-900">
                {people}명
              </span>
              <button
                type="button"
                onClick={() => setPeople((p) => Math.min(20, p + 1))}
                className="w-12 h-12 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-xl font-bold"
              >
                +
              </button>
            </div>
          </div>

          {/* 결제 수단 */}
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <label className="flex items-center text-sm font-medium text-gray-700 mb-3">
              <CreditCard className="w-4 h-4 mr-2 text-green-600" />
              결제 수단
            </label>
            <div className="grid grid-cols-2 gap-3">
              {[
                { value: "CARD", label: "신용카드" },
                { value: "KAKAO", label: "카카오페이" },
              ].map((method) => (
                <button
                  key={method.value}
                  type="button"
                  onClick={() => setPaymentMethod(method.value)}
                  className={`p-3 rounded-lg border-2 text-center font-medium transition-colors ${
                    paymentMethod === method.value
                      ? "border-green-500 bg-green-50 text-green-700"
                      : "border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {method.label}
                </button>
              ))}
            </div>
          </div>

          {/* 예약 정보 요약 */}
          <div className="bg-green-50 rounded-xl p-4 border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">예약 정보 확인</h3>
            <div className="space-y-1 text-sm text-green-700">
              <p>날짜: {reservationDate || "-"}</p>
              <p>시간: {reservationTime || "-"}</p>
              <p>인원: {people}명</p>
              <p>결제: {paymentMethod === "CARD" ? "신용카드" : "카카오페이"}</p>
            </div>
          </div>

          {/* 예약 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-4 rounded-xl text-lg font-semibold transition-colors ${
              isSubmitting
                ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700 text-white"
            }`}
          >
            {isSubmitting ? "예약 중..." : "예약하기"}
          </button>
        </form>
      </main>
    </div>
  );
}
