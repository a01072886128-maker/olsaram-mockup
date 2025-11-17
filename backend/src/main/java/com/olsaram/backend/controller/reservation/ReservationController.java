package com.olsaram.backend.controller.reservation;

import com.olsaram.backend.domain.reservation.Payment;
import com.olsaram.backend.domain.reservation.Reservation;
import com.olsaram.backend.domain.reservation.Reward;
import com.olsaram.backend.dto.reservation.OwnerReservationResponse;
import com.olsaram.backend.dto.reservation.ReservationStatusUpdateRequest;
import com.olsaram.backend.service.reservation.PaymentService;
import com.olsaram.backend.service.reservation.ReservationService;
import com.olsaram.backend.service.reservation.RewardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReservationController {

    private final ReservationService reservationService;
    private final PaymentService paymentService;
    private final RewardService rewardService;

    // ─────────────────────────────────────────────
    // 🗓️ 예약 (Reservation)
    // ─────────────────────────────────────────────
    @PostMapping("/reservations")
    public Reservation createReservation(@RequestBody Reservation reservation) {
        return reservationService.createReservation(reservation);
    }

    @GetMapping("/reservations")
    public List<Reservation> getAllReservations() {
        return reservationService.getAllReservations();
    }

    @GetMapping("/owners/{ownerId}/reservations")
    public List<OwnerReservationResponse> getReservationsByOwnerId(@PathVariable Long ownerId) {
        return reservationService.getReservationsByOwnerId(ownerId);
    }

    @GetMapping("/reservations/{id}")
    public Reservation getReservationById(@PathVariable Long id) {
        return reservationService.getReservationById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));
    }

    @DeleteMapping("/reservations/{id}")
    public void deleteReservation(@PathVariable Long id) {
        reservationService.deleteReservation(id);
    }

    @PatchMapping("/reservations/{id}/status")
    public Reservation updateReservationStatus(
            @PathVariable Long id,
            @RequestBody ReservationStatusUpdateRequest request
    ) {
        return reservationService.updateReservationStatus(id, request);
    }

    // ─────────────────────────────────────────────
    // 💳 결제 (Payment)
    // ─────────────────────────────────────────────
    @PostMapping("/payments")
    public Payment createPayment(@RequestBody Payment payment) {
        return paymentService.createPayment(payment);
    }

    @GetMapping("/payments")
    public List<Payment> getAllPayments() {
        return paymentService.getAllPayments();
    }

    @GetMapping("/payments/{id}")
    public Payment getPaymentById(@PathVariable Long id) {
        return paymentService.getPaymentById(id)
                .orElseThrow(() -> new RuntimeException("Payment not found"));
    }

    @DeleteMapping("/payments/{id}")
    public void deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
    }

    // ─────────────────────────────────────────────
    // 🎁 리워드 (Reward)
    // ─────────────────────────────────────────────
    @PostMapping("/rewards")
    public Reward addReward(@RequestBody Reward reward) {
        return rewardService.addReward(reward);
    }

    @GetMapping("/rewards")
    public List<Reward> getAllRewards() {
        return rewardService.getAllRewards();
    }

    @GetMapping("/rewards/{id}")
    public Reward getRewardById(@PathVariable Long id) {
        return rewardService.getRewardById(id)
                .orElseThrow(() -> new RuntimeException("Reward not found"));
    }

    @DeleteMapping("/rewards/{id}")
    public void deleteReward(@PathVariable Long id) {
        rewardService.deleteReward(id);
    }

    // ─────────────────────────────────────────────
    // 🔄 예약 + 결제 + 리워드 통합 처리
    // ─────────────────────────────────────────────
    @PostMapping("/reservations/full")
    public Map<String, Object> createFullReservation(@RequestBody Reservation reservation) {

        // 1️⃣ 예약 저장
        Reservation savedReservation = reservationService.createReservation(reservation);

        // 2️⃣ 결제 처리 (예약 직후 결제 자동 생성)
        Payment payment = Payment.builder()
                .reservationId(savedReservation.getId())
                .paymentMethod("CARD")
                .amount(20000.0)
                .paidAt(LocalDateTime.now())
                .build();
        Payment savedPayment = paymentService.createPayment(payment);

        // 3️⃣ 리워드 적립 (예약한 회원에게 포인트 부여)
        Reward reward = Reward.builder()
                .memberId(savedReservation.getMemberId())
                .points(200)
                .reason("예약 완료 리워드")
                .build();
        Reward savedReward = rewardService.addReward(reward);

        // 4️⃣ 통합 응답 반환
        Map<String, Object> response = new HashMap<>();
        response.put("reservation", savedReservation);
        response.put("payment", savedPayment);
        response.put("reward", savedReward);

        return response;
    }
}
