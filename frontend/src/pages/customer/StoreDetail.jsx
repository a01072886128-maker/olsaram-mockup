import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
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

  if (loading) return <p className="text-center mt-20">불러오는 중...</p>;
  if (!store)
    return <p className="text-center mt-20">가게 정보를 찾을 수 없습니다.</p>;

  return (
    <div className="p-6 space-y-10">
      {/* 가게 정보 */}
      <div>
        <h1 className="text-3xl font-bold">{store.name}</h1>
        <p className="mt-2">{store.address}</p>
        <p className="text-yellow-600 font-semibold mt-1">⭐ {store.rating}</p>
      </div>

      {/* 메뉴 */}
      <section>
        <h2 className="text-xl font-bold mb-3">메뉴</h2>
        {menus.length === 0 ? (
          <p>등록된 메뉴가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {menus.map((menu) => (
              <li key={menu.menuId} className="border p-3 rounded-md">
                {menu.menuName} - {menu.price}원
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 리뷰 */}
      <section>
        <h2 className="text-xl font-bold mb-3">리뷰</h2>
        {reviews.length === 0 ? (
          <p>등록된 리뷰가 없습니다.</p>
        ) : (
          <ul className="space-y-2">
            {reviews.map((review) => (
              <li key={review.reviewId} className="border p-3 rounded-md">
                <p className="font-semibold">⭐ {review.rating}</p>
                <p>{review.content}</p>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* 예약 폼 */}
      <section>
        <h2 className="text-2xl font-bold mt-10 mb-5">예약 정보 입력</h2>

        <form onSubmit={handleReserve} className="space-y-5">
          {/* 날짜 시간 */}
          <input
            type="datetime-local"
            className="border p-3 rounded w-full"
            value={reservationTime}
            onChange={(e) => setReservationTime(e.target.value)}
            required
          />

          {/* 인원 */}
          <input
            type="number"
            min="1"
            className="border p-3 rounded w-full"
            value={people}
            onChange={(e) => setPeople(e.target.value)}
            required
          />

          {/* ⭐ 결제수단 */}
          <select
            className="border p-3 rounded w-full"
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value)}
            required
          >
            <option value="">결제수단 선택</option>
            <option value="CARD">카드결제</option>
            <option value="BANK">계좌이체</option>
            <option value="EASY">간편결제</option>
          </select>

          {/* 예약 버튼 */}
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 rounded-lg text-lg"
          >
            예약 및 결제하기
          </button>
        </form>
      </section>
    </div>
  );
}
