import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { storeAPI } from "../../services/store";

export default function StoreReserve() {
  const { storeId } = useParams();
  const navigate = useNavigate();

  const [memberId, setMemberId] = useState(1);
  const [reservationTime, setReservationTime] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = {
      memberId,
      businessId: Number(storeId),
      reservationTime,
      status: "CONFIRMED",
      paymentStatus: "PAID",
    };

    try {
      await storeAPI.createReservation(data);
      alert("예약이 완료되었습니다!");
      navigate("/customer/mypage");
    } catch (e) {
      alert("예약 중 오류 발생: " + e.message);
    }
  };

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">예약 정보 입력</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="datetime-local"
          className="border p-3 rounded w-full"
          value={reservationTime}
          onChange={(e) => setReservationTime(e.target.value)}
          required
        />

        <button className="w-full bg-green-600 text-white py-3 rounded-lg text-lg">
          예약하기
        </button>
      </form>
    </div>
  );
}
