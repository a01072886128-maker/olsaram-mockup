package com.olsaram.backend.controller.reservation;

import com.olsaram.backend.domain.business.Business;
import com.olsaram.backend.domain.reservation.Payment;
import com.olsaram.backend.domain.reservation.Reservation;
import com.olsaram.backend.domain.reservation.Reward;
import com.olsaram.backend.dto.reservation.OwnerReservationResponse;
import com.olsaram.backend.dto.reservation.ReservationStatusUpdateRequest;
import com.olsaram.backend.dto.reservation.ReservationFullPayRequest;  // ⭐ 추가
import com.olsaram.backend.repository.BusinessRepository;
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

    private final BusinessRepository businessRepository;

    // 🏪 가게 상세 조회
    @GetMapping("/reservations/business/{businessId}")
    public Business getBusinessById(@PathVariable Long businessId) {
        return businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found (id=" + businessId + ")"));
    }

    // 🗓️ 예약 CRUD

    @PostMapping("/reservations")
    public Reservation createReservation(@RequestBody Reservation reservation) {
        return reservationService.createReservation(reservation);
    }

    @GetMapping("/reservations")
    public List<Reservation> getAllReservations() {
        return reservationService.getAllReservations();
    }

    @GetMapping("/reservations/{id}")
    public Reservation getReservationById(@PathVariable Long id) {
        return reservationService.getReservationById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found (id=" + id + ")"));
    }

    @PutMapping("/reservations/{id}")
    public Reservation updateReservation(
            @PathVariable Long id,
            @RequestBody Reservation request
    ) {
        return reservationService.updateReservation(id, request);
    }

    @PatchMapping("/reservations/{id}/status")
    public Reservation updateReservationStatus(
            @PathVariable Long id,
            @RequestBody ReservationStatusUpdateRequest request
    ) {
        return reservationService.updateReservationStatus(id, request);
    }

    @DeleteMapping("/reservations/{id}")
    public void deleteReservation(@PathVariable Long id) {
        reservationService.deleteReservation(id);
    }

    // 🔎 고객 예약 조회
    @GetMapping("/reservations/member/{memberId}")
    public List<Reservation> getReservationsByMember(@PathVariable Long memberId) {
        return reservationService.getReservationsByMemberId(memberId);
    }

    // 🧑‍🍳 사장님 예약 조회
    @GetMapping("/owners/{ownerId}/reservations")
    public List<OwnerReservationResponse> getReservationsByOwnerId(@PathVariable Long ownerId) {
        return reservationService.getReservationsByOwnerId(ownerId);
    }

    // 💳 결제 (Payment)
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
                .orElseThrow(() -> new RuntimeException("Payment not found (id=" + id + ")"));
    }

    @DeleteMapping("/payments/{id}")
    public void deletePayment(@PathVariable Long id) {
        paymentService.deletePayment(id);
    }

    // 🎁 리워드 조회/관리
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
                .orElseThrow(() -> new RuntimeException("Reward not found (id=" + id + ")"));
    }

    @DeleteMapping("/rewards/{id}")
    public void deleteReward(@PathVariable Long id) {
        rewardService.deleteReward(id);
    }

    // 🔄 기존 full 버전 (예약 + 결제 + 리워드)
    @PostMapping("/reservations/full")
    public Map<String, Object> createFullReservation(@RequestBody Reservation reservation) {

        Reservation savedReservation = reservationService.createReservation(reservation);

        Payment payment = Payment.builder()
                .reservationId(savedReservation.getId())
                .paymentMethod("CARD")
                .amount(20000.0)
                .paidAt(LocalDateTime.now())
                .build();
        Payment savedPayment = paymentService.createPayment(payment);

        Reward reward = Reward.builder()
                .memberId(savedReservation.getMemberId())
                .points(200)
                .reason("예약 완료 리워드")
                .build();
        Reward savedReward = rewardService.addReward(reward);

        Map<String, Object> response = new HashMap<>();
        response.put("reservation", savedReservation);
        response.put("payment", savedPayment);
        response.put("reward", savedReward);

        return response;
    }


    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ 
    // 🔥 새로운 모의 결제 API (프론트에서 호출하는 것)
    // ⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐⭐ 

    @PostMapping("/reservations/full-pay")
    public Reservation createWithPayment(@RequestBody ReservationFullPayRequest req) {
        return reservationService.createWithPayment(req);
    }
}
