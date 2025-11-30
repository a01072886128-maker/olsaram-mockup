import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import { loadTossPayments, ANONYMOUS } from "@tosspayments/tosspayments-sdk";
import storeAPI from "../../services/store";
import paymentAPI from "../../services/payment";
import { useAuth } from "../../contexts/AuthContext";

export default function StoreDetail() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [store, setStore] = useState(null);
  const [menus, setMenus] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paymentResult, setPaymentResult] = useState(null);
  const [widgets, setWidgets] = useState(null);
  const [paymentReady, setPaymentReady] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentOrderInfo, setCurrentOrderInfo] = useState(null);

  // 🔥 로그인한 고객 정보
  const memberId = user?.customerId;

  // 예약 입력 상태
  const [reservationTime, setReservationTime] = useState("");
  const [people, setPeople] = useState(1);

  const formatCurrency = (value) => {
    const num = Number(value);
    if (Number.isNaN(num)) return "-";
    return `${num.toLocaleString("ko-KR")}원`;
  };

  // 모달 상태 관리 (ESC, 스크롤 방지)
  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        navigate(-1);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleEsc);

    return () => {
      document.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = originalOverflow;
    };
  }, [navigate]);

  // 결제 위젯 초기화 (모달이 열릴 때만)
  useEffect(() => {
    if (!showPaymentModal || !currentOrderInfo) {
      return;
    }

    async function initializePaymentWidget() {
      const clientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm";
      const customerKey = `customer_${currentOrderInfo.reservationId}_${Date.now()}`;
      
      try {
        // DOM 요소가 준비될 때까지 대기
        await new Promise(resolve => setTimeout(resolve, 100));
        
        const tossPayments = await loadTossPayments(clientKey);
        const paymentWidgets = tossPayments.widgets({
          customerKey: customerKey,
        });

        // 결제 금액 설정
        await paymentWidgets.setAmount({
          currency: "KRW",
          value: Number(currentOrderInfo.orderResult.amount),
        });

        // 결제 위젯 렌더링 (DOM 요소가 존재하는지 확인)
        const paymentMethodElement = document.getElementById("payment-method");
        const agreementElement = document.getElementById("agreement");

        if (!paymentMethodElement || !agreementElement) {
          console.error("결제 위젯 DOM 요소를 찾을 수 없습니다.");
          return;
        }

        await Promise.all([
          paymentWidgets.renderPaymentMethods({
            selector: "#payment-method",
            variantKey: "DEFAULT",
          }),
          paymentWidgets.renderAgreement({
            selector: "#agreement",
            variantKey: "AGREEMENT",
          }),
        ]);

        setWidgets(paymentWidgets);
        setPaymentReady(true);
      } catch (error) {
        console.error("❌ 결제 위젯 초기화 실패:", error);
        alert("결제 위젯 초기화 중 오류가 발생했습니다: " + (error.message || "알 수 없는 오류"));
      }
    }

    initializePaymentWidget();

    // 정리 함수: 모달이 닫힐 때 위젯 상태 초기화
    return () => {
      setWidgets(null);
      setPaymentReady(false);
    };
  }, [showPaymentModal, currentOrderInfo]);

  // 가게 데이터 불러오기
  useEffect(() => {
    async function load() {
      try {
        const detail = await storeAPI.getStoreDetail(storeId);
        const menuList = await storeAPI.getStoreMenus(storeId);
        const reviewList = await storeAPI.getStoreReviews(storeId);

        setStore(detail);
        setMenus(menuList);
        setReviews(reviewList);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [storeId]);

  // ⭐ 예약 + 모의 결제 처리
  const handleReserve = async (e) => {
    e.preventDefault();

    if (!memberId) {
      alert("로그인이 필요합니다.");
      return;
    }

    if (!reservationTime) {
      alert("예약 시간을 선택해주세요.");
      return;
    }


    // datetime-local → ISO 변환
    const isoTime =
      reservationTime.length === 16 ? reservationTime + ":00" : reservationTime;

    const data = {
      memberId,
      businessId: Number(storeId),
      people: Number(people),
      reservationTime: isoTime,
    };

    try {
      // 1. 예약 생성 (결제 대기 상태)
      const reservationResult = await storeAPI.fullPayReservation(data);
      setPaymentResult(reservationResult);

      const chargedAmount = reservationResult?.chargedAmount || 0;
      const reservationId = reservationResult?.reservationId;

      if (!reservationId) {
        throw new Error("예약 생성에 실패했습니다.");
      }

      // 2. 토스 페이먼츠 결제 주문 생성
      const orderResult = await paymentAPI.createTossPaymentOrder({
        reservationId: reservationId,
        amount: Math.round(chargedAmount),
        orderName: `예약금 결제 - ${store?.businessName || "가게"}`,
        customerName: user?.name || "고객",
        customerEmail: user?.email || "customer@example.com",
      });

      console.log("✅ 토스 페이먼츠 결제 주문 생성 성공", orderResult);

      // 3. 결제 모달 표시
      setCurrentOrderInfo({
        reservationId: reservationId,
        reservationResult: reservationResult,
        orderResult: orderResult,
        chargedAmount: chargedAmount,
      });
      setShowPaymentModal(true);
      
      // URL 파라미터로 전달할 정보를 sessionStorage에 저장
      // URL 파라미터로 전달할 정보를 sessionStorage에 저장 (결제 완료 후 alert 표시용)
      sessionStorage.setItem("paymentInfo", JSON.stringify({
        reservationId: reservationId,
        orderId: orderResult.orderId,
        amount: orderResult.amount,
        reservationResult: reservationResult, // 결제 정보 표시용
      }));
    } catch (err) {
      alert("예약/결제 오류: " + err.message);
      console.error(err);
    }
  };

  const closeModal = () => navigate(-1);

  // 결제 처리 함수
  const handlePayment = async () => {
    if (!widgets || !currentOrderInfo) {
      alert("결제 위젯이 준비되지 않았습니다.");
      return;
    }

    try {
      const { reservationId, orderResult } = currentOrderInfo;

      const paymentData = {
        orderId: orderResult.orderId,
        orderName: orderResult.orderName,
        customerEmail: orderResult.customerEmail || "customer@example.com",
        customerName: orderResult.customerName || "고객",
        successUrl: `${window.location.origin}/payment/success`,
        failUrl: `${window.location.origin}/payment/fail`,
      };

      console.log("🔵 토스 페이먼츠 결제 요청:", paymentData);

      // 결제 요청
      await widgets.requestPayment(paymentData);
      
      // 결제 성공 시 successUrl로 리다이렉트되므로 여기서는 처리하지 않음
    } catch (error) {
      console.error("❌ 토스 페이먼츠 결제 실패:", error);
      // 사용자가 결제를 취소한 경우는 에러 메시지를 표시하지 않음
      if (error.code !== "USER_CANCEL" && error.code !== "PAY_PROCESS_CANCELED") {
        alert("결제가 취소되었거나 실패했습니다: " + (error.message || "알 수 없는 오류"));
      }
    }
  };

  const renderContent = () => {
    if (loading) {
      return (
        <div className="flex flex-col items-center justify-center py-16">
          <Loader2 className="w-10 h-10 text-primary-green animate-spin mb-4" />
          <p className="text-slate-600">가게 정보를 불러오는 중입니다...</p>
        </div>
      );
    }

    if (!store) {
      return (
        <div className="py-12 text-center text-slate-600">
          가게 정보를 찾을 수 없습니다.
        </div>
      );
    }

    return (
      <div className="space-y-10">
        {/* 가게 정보 */}
        <header className="space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-widest text-primary-green mb-1">
                STORE DETAIL
              </p>
              <h1 className="text-3xl font-bold text-slate-900">
                {store.name}
              </h1>
              <p className="text-slate-600 mt-1">{store.address}</p>
            </div>
            <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-2xl font-semibold text-lg">
              ⭐ {store.rating?.toFixed?.(1) ?? store.rating ?? "0.0"}
            </div>
          </div>
          <div className="text-sm text-primary-green/80">
            예약 시 노쇼 방지 정책이 적용됩니다.
            {store.reservationFeeAmount != null && (
              <span className="ml-2 inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-emerald-700">
                기본 예약 수수료 {formatCurrency(store.reservationFeeAmount)} / 1인
              </span>
            )}
          </div>
        </header>

        {/* 메뉴 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">대표 메뉴</h2>
            <span className="text-sm text-slate-400">
              {menus.length}개 등록됨
            </span>
          </div>

          {menus.length === 0 ? (
            <p className="text-slate-500">등록된 메뉴가 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {menus.map((menu) => (
                <li
                  key={menu.menuId}
                  className="flex items-center justify-between border rounded-xl px-5 py-3 hover:bg-slate-50"
                >
                  <span className="font-medium text-slate-800">
                    {menu.menuName}
                  </span>
                  <span className="text-slate-600">{menu.price}원</span>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 리뷰 */}
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-slate-900">고객 리뷰</h2>
            <span className="text-sm text-slate-400">
              {reviews.length}개 등록됨
            </span>
          </div>

          {reviews.length === 0 ? (
            <p className="text-slate-500">등록된 리뷰가 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {reviews.map((review) => (
                <li
                  key={review.reviewId}
                  className="border rounded-xl px-5 py-3 space-y-1"
                >
                  <p className="font-semibold text-yellow-600">
                    ⭐ {review.rating}
                  </p>
                  <p className="text-slate-700">{review.content}</p>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 예약 폼 */}
        <section>
          <h2 className="text-2xl font-semibold text-slate-900 mb-4">
            예약 정보 입력
          </h2>

          <form onSubmit={handleReserve} className="space-y-4">
            <div>
              <label className="text-sm text-slate-500">예약 일시</label>
              <input
                type="datetime-local"
                className="mt-1 border rounded-xl px-4 py-3 w-full"
                value={reservationTime}
                onChange={(e) => setReservationTime(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm text-slate-500">예약 인원</label>
              <input
                type="number"
                min="1"
                className="mt-1 border rounded-xl px-4 py-3 w-full"
                value={people}
                onChange={(e) => setPeople(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="w-full bg-primary-green text-white py-3 rounded-2xl text-lg font-semibold hover:bg-dark-green transition"
            >
              예약 및 결제하기
            </button>

          </form>
        </section>
      </div>
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40"
        role="presentation"
        onClick={closeModal}
      />

      <div className="relative w-full max-w-4xl rounded-3xl bg-white shadow-2xl border border-slate-100">
        <button
          type="button"
          aria-label="닫기"
          className="absolute right-4 top-4 p-2 rounded-full bg-white/80 text-primary-green shadow hover:bg-white"
          onClick={closeModal}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="max-h-[85vh] overflow-y-auto p-6 sm:p-10">
          {showPaymentModal && currentOrderInfo ? (
            // 결제 모달
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold text-slate-900">결제하기</h2>
              
              <div className="bg-slate-50 rounded-xl p-4">
                <p className="text-sm text-slate-600 mb-2">주문 정보</p>
                <p className="font-semibold text-slate-900">{currentOrderInfo.orderResult.orderName}</p>
                <p className="text-lg font-bold text-primary-green mt-2">
                  {formatCurrency(currentOrderInfo.chargedAmount)}
                </p>
              </div>

              {/* 결제 수단 UI */}
              <div>
                <p className="text-sm font-semibold text-slate-900 mb-3">결제 수단</p>
                <div id="payment-method" className="mb-4" />
              </div>

              {/* 이용약관 UI */}
              <div>
                <div id="agreement" />
              </div>

              {/* 결제하기 버튼 */}
              <button
                onClick={handlePayment}
                disabled={!paymentReady}
                className="w-full bg-primary-green text-white py-4 rounded-2xl text-lg font-semibold hover:bg-dark-green transition disabled:bg-slate-300 disabled:cursor-not-allowed"
              >
                {paymentReady ? "결제하기" : "결제 위젯 로딩 중..."}
              </button>

              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setCurrentOrderInfo(null);
                  setWidgets(null);
                  setPaymentReady(false);
                }}
                className="w-full border border-slate-300 text-slate-700 py-3 rounded-2xl text-lg font-semibold hover:bg-slate-50 transition"
              >
                취소
              </button>
            </div>
          ) : (
            renderContent()
          )}
        </div>
      </div>
    </div>
  );
}
