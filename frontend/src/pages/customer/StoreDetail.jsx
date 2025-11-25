import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Loader2, X } from "lucide-react";
import storeAPI from "../../services/store";
import { useAuth } from "../../contexts/AuthContext";

export default function StoreDetail() {
  const { storeId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [store, setStore] = useState(null);
  const [menus, setMenus] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔥 로그인한 고객 정보
  const memberId = user?.customerId;

  // 예약 입력 상태
  const [reservationTime, setReservationTime] = useState("");
  const [people, setPeople] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState(""); // ⭐ 추가

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

    if (!paymentMethod) {
      alert("결제수단을 선택해주세요.");
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
      paymentMethod, // ⭐ 추가!
    };

    try {
      await storeAPI.fullPayReservation(data);
      alert("예약 및 결제가 완료되었습니다!");
      navigate("/customer/mypage");
    } catch (err) {
      alert("예약/결제 오류: " + err.message);
      console.error(err);
    }
  };

  const closeModal = () => navigate(-1);

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

            <div>
              <label className="text-sm text-slate-500">결제 수단</label>
              <select
                className="mt-1 border rounded-xl px-4 py-3 w-full"
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                required
              >
                <option value="">결제수단 선택</option>
                <option value="CARD">카드결제</option>
                <option value="BANK">계좌이체</option>
                <option value="EASY">간편결제</option>
              </select>
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
          {renderContent()}
        </div>
      </div>
    </div>
  );
}
