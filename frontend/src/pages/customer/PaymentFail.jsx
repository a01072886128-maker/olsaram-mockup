import { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";

export default function PaymentFail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const errorCode = searchParams.get("code");
    const errorMessage = searchParams.get("message");

    // sessionStorage 정리
    sessionStorage.removeItem("paymentInfo");

    if (errorCode || errorMessage) {
      alert(`결제가 실패했습니다: ${errorMessage || errorCode}`);
    } else {
      alert("결제가 취소되었습니다.");
    }

    navigate("/customer/nearby");
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">결제 실패</h1>
        <p className="text-gray-600">결제 처리 중 오류가 발생했습니다.</p>
      </div>
    </div>
  );
}

