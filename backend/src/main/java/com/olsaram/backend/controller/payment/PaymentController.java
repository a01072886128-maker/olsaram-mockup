package com.olsaram.backend.controller.payment;

import com.olsaram.backend.domain.reservation.Reservation;
import com.olsaram.backend.dto.payment.TossPaymentOrderRequest;
import com.olsaram.backend.dto.payment.TossPaymentOrderResponse;
import com.olsaram.backend.dto.payment.TossPaymentRequest;
import com.olsaram.backend.service.payment.TossPaymentService;
import com.olsaram.backend.service.reservation.ReservationPaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
@Slf4j
public class PaymentController {

    private final TossPaymentService tossPaymentService;
    private final ReservationPaymentService reservationPaymentService;

    /**
     * 토스 페이먼츠 결제 주문 생성
     * POST /api/payments/toss/order
     */
    @PostMapping("/toss/order")
    public ResponseEntity<TossPaymentOrderResponse> createTossPaymentOrder(
            @RequestBody TossPaymentOrderRequest request
    ) {
        try {
            log.info("토스 페이먼츠 결제 주문 생성 요청 - 예약ID: {}, 금액: {}원",
                    request.getReservationId(), request.getAmount());

            TossPaymentOrderResponse response = tossPaymentService.createOrder(request);

            log.info("토스 페이먼츠 결제 주문 생성 성공 - 주문ID: {}, 금액: {}원",
                    response.getOrderId(), response.getAmount());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("토스 페이먼츠 결제 주문 생성 실패: {}", e.getMessage(), e);
            throw new RuntimeException("결제 주문 생성 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 토스 페이먼츠 결제 승인 및 예약 상태 업데이트
     * POST /api/payments/toss/confirm
     */
    @PostMapping("/toss/confirm")
    public ResponseEntity<Map<String, Object>> confirmTossPayment(
            @RequestBody TossPaymentRequest request
    ) {
        try {
            log.info("토스 페이먼츠 결제 승인 요청 - 예약ID: {}, 주문ID: {}, 금액: {}원",
                    request.getReservationId(), request.getOrderId(), request.getAmount());

            // 결제 승인 및 예약 상태 업데이트
            Reservation reservation = reservationPaymentService.confirmReservationPayment(request);

            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("reservationId", reservation.getId());
            response.put("paymentStatus", reservation.getPaymentStatus().name());
            response.put("message", "결제가 완료되었습니다.");

            log.info("토스 페이먼츠 결제 승인 성공 - 예약ID: {}, 주문ID: {}, 상태: {}",
                    reservation.getId(), request.getOrderId(), reservation.getPaymentStatus());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("토스 페이먼츠 결제 승인 실패: {}", e.getMessage(), e);
            throw new RuntimeException("결제 승인 실패: " + e.getMessage(), e);
        }
    }
}

