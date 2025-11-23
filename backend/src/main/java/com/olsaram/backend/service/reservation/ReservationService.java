package com.olsaram.backend.service.reservation;

import com.olsaram.backend.domain.business.Business;
import com.olsaram.backend.domain.customer.Customer;
import com.olsaram.backend.domain.reservation.PaymentStatus;
import com.olsaram.backend.domain.reservation.Reservation;
import com.olsaram.backend.domain.reservation.ReservationStatus;
import com.olsaram.backend.dto.reservation.OwnerReservationResponse;
import com.olsaram.backend.dto.reservation.ReservationFullPayRequest;
import com.olsaram.backend.dto.reservation.ReservationStatusUpdateRequest;
import com.olsaram.backend.dto.reservation.ReservationWithRiskResponse;
import com.olsaram.backend.repository.BusinessRepository;
import com.olsaram.backend.repository.CustomerRepository;
import com.olsaram.backend.repository.reservation.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final PaymentService paymentService;
    private final RiskCalculationService riskCalculationService;

    // -------------------------
    // CREATE
    // -------------------------
    public Reservation createReservation(Reservation reservation) {
        return reservationRepository.save(reservation);
    }

    // -------------------------
    // BASIC GETTERS
    // -------------------------
    public List<Reservation> getAllReservations() {
        return reservationRepository.findAll();
    }

    public Optional<Reservation> getReservationById(Long id) {
        return reservationRepository.findById(id);
    }

    public List<Reservation> getReservationsByMemberId(Long memberId) {
        return reservationRepository.findByMemberId(memberId);
    }

    // -------------------------
    // OWNER 예약조회 (사장님)
    // -------------------------
    public List<OwnerReservationResponse> getReservationsByOwnerId(Long ownerId) {

        List<Business> businesses = businessRepository.findByOwner_OwnerId(ownerId);
        if (businesses.isEmpty()) return Collections.emptyList();

        List<Long> businessIds = businesses.stream()
                .map(Business::getBusinessId)
                .filter(Objects::nonNull)
                .toList();

        if (businessIds.isEmpty()) return Collections.emptyList();

        List<Reservation> reservations = reservationRepository.findByBusinessIdIn(businessIds);

        Map<Long, Business> businessMap = businesses.stream()
                .collect(Collectors.toMap(
                        Business::getBusinessId,
                        b -> b,
                        (a, b) -> a
                ));

        Map<Long, String> customerNameMap = customerRepository
                .findAllById(
                        reservations.stream()
                                .map(Reservation::getMemberId)
                                .filter(Objects::nonNull)
                                .collect(Collectors.toSet())
                )
                .stream()
                .collect(Collectors.toMap(
                        Customer::getCustomerId,
                        Customer::getName,
                        (a, b) -> a
                ));

        return reservations.stream()
                .map(reservation -> OwnerReservationResponse.builder()
                        .id(reservation.getId())
                        .businessId(reservation.getBusinessId())
                        .businessName(
                                businessMap.containsKey(reservation.getBusinessId())
                                        ? businessMap.get(reservation.getBusinessId()).getBusinessName()
                                        : null)
                        .businessAddress(
                                businessMap.containsKey(reservation.getBusinessId())
                                        ? businessMap.get(reservation.getBusinessId()).getAddress()
                                        : null)
                        .memberId(reservation.getMemberId())
                        .customerName(customerNameMap.get(reservation.getMemberId()))
                        .reservationTime(reservation.getReservationTime())
                        .people(reservation.getPeople())   // 🔥 추가됨 (예약 인원)
                        .status(reservation.getStatus() != null ? reservation.getStatus().name() : null)
                        .paymentStatus(reservation.getPaymentStatus() != null ? reservation.getPaymentStatus().name() : null)
                        .build())
                .toList();
    }

    // -------------------------
    // UPDATE (전체 업데이트)
    // -------------------------
    public Reservation updateReservation(Long id, Reservation request) {

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Reservation not found id=" + id));

        if (request.getMemberId() != null)
            reservation.setMemberId(request.getMemberId());

        if (request.getBusinessId() != null)
            reservation.setBusinessId(request.getBusinessId());

        if (request.getPeople() != null)
            reservation.setPeople(request.getPeople());

        if (request.getReservationTime() != null)
            reservation.setReservationTime(request.getReservationTime());

        if (request.getStatus() != null)
            reservation.setStatus(request.getStatus());

        if (request.getPaymentStatus() != null)
            reservation.setPaymentStatus(request.getPaymentStatus());

        return reservationRepository.save(reservation);
    }

    // -------------------------
    // STATUS UPDATE (부분 업데이트)
    // -------------------------
    public Reservation updateReservationStatus(Long reservationId, ReservationStatusUpdateRequest request) {

        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found"));

        if (StringUtils.hasText(request.getStatus()))
            reservation.setStatus(ReservationStatus.valueOf(request.getStatus()));

        if (StringUtils.hasText(request.getPaymentStatus()))
            reservation.setPaymentStatus(PaymentStatus.valueOf(request.getPaymentStatus()));

        return reservationRepository.save(reservation);
    }

    // -------------------------
    // DELETE
    // -------------------------
    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }
    // -------------------------
// ⭐ 예약 + 모의 결제 통합 처리
// -------------------------
public Reservation createWithPayment(ReservationFullPayRequest req) {

    // 1. 예약 엔티티 생성
    Reservation reservation = new Reservation();
    reservation.setMemberId(req.getMemberId());
    reservation.setBusinessId(req.getBusinessId());
    reservation.setPeople(req.getPeople());
    reservation.setReservationTime(java.time.LocalDateTime.parse(req.getReservationTime()));
    reservation.setStatus(ReservationStatus.CONFIRMED);

    // 기본적으로 결제 대기
    reservation.setPaymentStatus(PaymentStatus.PENDING);

    // DB 저장
    Reservation savedReservation = reservationRepository.save(reservation);

    // 2. 모의 결제 처리 (Payment 엔티티 생성)
    com.olsaram.backend.domain.reservation.Payment payment =
            com.olsaram.backend.domain.reservation.Payment.builder()
                    .reservationId(savedReservation.getId())
                    .paymentMethod(req.getPaymentMethod())
                    .amount(0.0)       // 일단 0원 결제
                    .paidAt(java.time.LocalDateTime.now())
                    .build();

    // PaymentService 사용
    paymentService.createPayment(payment);

    // 3. 결제 완료 상태로 변경
    savedReservation.setPaymentStatus(PaymentStatus.PAID);
    reservationRepository.save(savedReservation);

    return savedReservation;
}

    // -------------------------
    // ⭐ 위험도 포함 예약 조회 (사장님용)
    // -------------------------
    public List<ReservationWithRiskResponse> getReservationsWithRisk(Long ownerId) {

        List<Business> businesses = businessRepository.findByOwner_OwnerId(ownerId);
        if (businesses.isEmpty()) return Collections.emptyList();

        List<Long> businessIds = businesses.stream()
                .map(Business::getBusinessId)
                .filter(Objects::nonNull)
                .toList();

        if (businessIds.isEmpty()) return Collections.emptyList();

        List<Reservation> reservations = reservationRepository.findByBusinessIdIn(businessIds);

        Map<Long, Business> businessMap = businesses.stream()
                .collect(Collectors.toMap(
                        Business::getBusinessId,
                        b -> b,
                        (a, b) -> a
                ));

        // 고객 정보 조회 (전체 Customer 객체)
        Set<Long> memberIds = reservations.stream()
                .map(Reservation::getMemberId)
                .filter(Objects::nonNull)
                .collect(Collectors.toSet());

        Map<Long, Customer> customerMap = customerRepository
                .findAllById(memberIds)
                .stream()
                .collect(Collectors.toMap(
                        Customer::getCustomerId,
                        c -> c,
                        (a, b) -> a
                ));

        return reservations.stream()
                .map(reservation -> {
                    Customer customer = customerMap.get(reservation.getMemberId());
                    Business business = businessMap.get(reservation.getBusinessId());

                    // 위험도 계산
                    int riskScore = riskCalculationService.calculateRiskScore(customer, reservation);
                    String riskLevel = riskCalculationService.getRiskLevel(riskScore);
                    List<String> patterns = riskCalculationService.analyzeSuspiciousPatterns(customer, reservation);
                    List<String> actions = riskCalculationService.getAutoActions(riskLevel, reservation);

                    // 고객 이력 정보 생성
                    ReservationWithRiskResponse.CustomerRiskData customerData = null;
                    if (customer != null) {
                        int accountAgeDays = customer.getCreatedAt() != null
                                ? (int) ChronoUnit.DAYS.between(customer.getCreatedAt().toLocalDate(), LocalDateTime.now().toLocalDate())
                                : 365;

                        customerData = ReservationWithRiskResponse.CustomerRiskData.builder()
                                .customerId(customer.getCustomerId())
                                .name(customer.getName())
                                .phone(customer.getPhone())
                                .noShowCount(customer.getNoShowCount() != null ? customer.getNoShowCount() : 0)
                                .reservationCount(customer.getReservationCount() != null ? customer.getReservationCount() : 0)
                                .lastMinuteCancels(0) // 추후 구현
                                .accountAgeDays(accountAgeDays)
                                .trustScore(customer.getTrustScore() != null ? customer.getTrustScore() : 100)
                                .customerGrade(customer.getCustomerGrade())
                                .build();
                    }

                    return ReservationWithRiskResponse.builder()
                            .id(reservation.getId())
                            .businessId(reservation.getBusinessId())
                            .businessName(business != null ? business.getBusinessName() : null)
                            .businessAddress(business != null ? business.getAddress() : null)
                            .memberId(reservation.getMemberId())
                            .customerName(customer != null ? customer.getName() : null)
                            .customerPhone(customer != null ? customer.getPhone() : null)
                            .reservationTime(reservation.getReservationTime())
                            .people(reservation.getPeople())
                            .status(reservation.getStatus() != null ? reservation.getStatus().name() : null)
                            .paymentStatus(reservation.getPaymentStatus() != null ? reservation.getPaymentStatus().name() : null)
                            .customerData(customerData)
                            .riskScore(riskScore)
                            .riskLevel(riskLevel)
                            .suspiciousPatterns(patterns)
                            .autoActions(actions)
                            .build();
                })
                .sorted(Comparator.comparing(ReservationWithRiskResponse::getRiskScore)) // 위험도 순 정렬
                .toList();
    }
}
