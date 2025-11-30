package com.olsaram.backend.service.reservation;

import com.olsaram.backend.domain.reservation.Payment;
import com.olsaram.backend.domain.reservation.PaymentStatus;
import com.olsaram.backend.domain.reservation.Reservation;
import com.olsaram.backend.dto.payment.TossPaymentRequest;
import com.olsaram.backend.dto.payment.TossPaymentResponse;
import com.olsaram.backend.repository.reservation.ReservationRepository;
import com.olsaram.backend.service.payment.TossPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationPaymentService {

    private final TossPaymentService tossPaymentService;
    private final ReservationRepository reservationRepository;

    /**
     * 토스 페이먼츠 결제 승인 후 예약 상태 업데이트
     */
    @Transactional
    public Reservation confirmReservationPayment(TossPaymentRequest request) {
        Reservation reservation = reservationRepository.findById(request.getReservationId())
                .orElseThrow(() -> new RuntimeException("예약을 찾을 수 없습니다. ID: " + request.getReservationId()));

        // 토스 페이먼츠 결제 승인
        TossPaymentResponse paymentResponse = tossPaymentService.confirmPayment(request);

        if (!"DONE".equals(paymentResponse.getStatus())) {
            throw new RuntimeException("결제 승인 실패: " + paymentResponse.getFailureReason());
        }

        // 예약 상태를 결제 완료로 변경
        reservation.setPaymentStatus(PaymentStatus.PAID);
        reservationRepository.save(reservation);

        log.info("예약 결제 완료 - 예약ID: {}, 주문ID: {}, 금액: {}원",
                reservation.getId(), paymentResponse.getOrderId(), paymentResponse.getTotalAmount());

        return reservation;
    }
}

