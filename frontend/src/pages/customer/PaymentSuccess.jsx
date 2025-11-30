import { useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import paymentAPI from "../../services/payment";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasProcessed = useRef(false); // 중복 실행 방지

  useEffect(() => {
    // 이미 처리된 경우 중복 실행 방지
    if (hasProcessed.current) {
      return;
    }

    // 쿼리 파라미터 값이 결제 요청할 때 보낸 데이터와 동일한지 반드시 확인하세요.
    // 클라이언트에서 결제 금액을 조작하는 행위를 방지할 수 있습니다.
    const requestData = {
      orderId: searchParams.get("orderId"),
      amount: searchParams.get("amount"),
      paymentKey: searchParams.get("paymentKey"),
    };

    // sessionStorage에서 예약 정보 가져오기
    const paymentInfoStr = sessionStorage.getItem("paymentInfo");
    const paymentInfo = paymentInfoStr ? JSON.parse(paymentInfoStr) : null;
    
    const reservationId = paymentInfo?.reservationId;

    async function confirm() {
      if (!requestData.orderId || !requestData.amount || !requestData.paymentKey) {
        console.error("결제 정보가 불완전합니다:", requestData);
        sessionStorage.removeItem("paymentInfo");
        navigate("/customer/nearby");
        return;
      }

      // 처리 시작 표시
      hasProcessed.current = true;

      try {
        // 결제 승인 API 호출
        const confirmResult = await paymentAPI.confirmTossPayment({
          reservationId: parseInt(reservationId),
          paymentKey: requestData.paymentKey,
          orderId: requestData.orderId,
          amount: parseInt(requestData.amount),
        });

        // 예약 정보 가져오기 (결제 정보 표시용)
        const reservationInfo = paymentInfo?.reservationResult || null;
        
        // sessionStorage 정리
        sessionStorage.removeItem("paymentInfo");
        
        // 결제 완료 alert 표시 (한 번만)
        if (reservationInfo) {
          const formatCurrency = (value) => {
            const num = Number(value);
            if (Number.isNaN(num)) return "-";
            return `${num.toLocaleString("ko-KR")}원`;
          };
          
          const chargedAmount = formatCurrency(reservationInfo.chargedAmount || requestData.amount);
          const appliedPercent = reservationInfo.appliedFeePercent?.toFixed?.(2) ?? "0.00";
          const baseAmount = formatCurrency(reservationInfo.baseFeeAmount || 0);
          const people = reservationInfo.people || 1;
          
          alert(
            `결제 완료\n\n결제 금액: ${chargedAmount}\n위험도 기반 수수료율 ${appliedPercent}% × 기본금액 ${baseAmount} × 인원 ${people}명`
          );
        } else {
          alert("결제가 완료되었습니다!");
        }
        
        navigate("/customer/nearby");
      } catch (error) {
        console.error("결제 승인 실패:", error);
        sessionStorage.removeItem("paymentInfo");
        
        // 결제 실패 비즈니스 로직을 구현하세요.
        navigate(`/payment/fail?message=${error.message || "결제 승인 실패"}&code=${error.code || "UNKNOWN"}`);
      }
    }

    confirm();
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">결제 처리 중...</h1>
        <p className="text-gray-600">잠시만 기다려주세요.</p>
      </div>
    </div>
  );
}

