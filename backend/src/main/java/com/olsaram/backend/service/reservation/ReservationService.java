package com.olsaram.backend.service.reservation;

import com.olsaram.backend.domain.business.Business;
import com.olsaram.backend.domain.customer.Customer;
import com.olsaram.backend.domain.reservation.PaymentStatus;
import com.olsaram.backend.domain.reservation.Reservation;
import com.olsaram.backend.domain.reservation.ReservationStatus;
import com.olsaram.backend.dto.reservation.OwnerReservationResponse;
import com.olsaram.backend.dto.reservation.ReservationFullPayRequest;
import com.olsaram.backend.dto.reservation.ReservationPaymentResult;
import com.olsaram.backend.dto.reservation.ReservationStatusUpdateRequest;
import com.olsaram.backend.dto.reservation.ReservationWithRiskResponse;
import com.olsaram.backend.repository.BusinessRepository;
import com.olsaram.backend.repository.CustomerRepository;
import com.olsaram.backend.repository.reservation.ReservationRepository;
import com.olsaram.backend.service.ai.AiNoshowService;
import com.olsaram.backend.service.risk.ReservationRiskModelService;
import com.olsaram.backend.service.risk.ReservationRiskPrediction;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;


import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationService {

    private static final double DEFAULT_BASE_AMOUNT_PER_PERSON = 10000.0;

    private final ReservationRepository reservationRepository;
    private final BusinessRepository businessRepository;
    private final CustomerRepository customerRepository;
    private final PaymentService paymentService;
    private final RiskCalculationService riskCalculationService;
    private final AiNoshowService aiNoshowService;
    private final ReservationRiskModelService reservationRiskModelService;



    // -------------------------
    // CREATE
    // -------------------------
    public Reservation createReservation(Reservation reservation) {
        // ⭐ customer 예약이 아닌 경우 ML 모델 실행하지 않음
        // customer 예약은 createWithPayment를 통해 처리됨
        Reservation savedReservation = reservationRepository.save(reservation);
        return savedReservation;
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

        // ⭐ ML 모델이 실행된 예약만 필터링 (mlModelUsed가 true인 예약만)
        reservations = reservations.stream()
                .filter(reservation -> reservation.getMlModelUsed() != null && reservation.getMlModelUsed())
                .toList();

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
        try {
            Reservation reservation = reservationRepository.findById(reservationId)
                    .orElseThrow(() -> new RuntimeException("Reservation not found (id=" + reservationId + ")"));

            // 기존 상태 저장 (변경 감지용) - null 안전 처리
            ReservationStatus oldStatus = reservation.getStatus();
            ReservationStatus newStatus = null;

            boolean isNoShowRequest = false;

            // 상태 업데이트
            if (StringUtils.hasText(request.getStatus())) {
                try {
                    String statusStr = request.getStatus().toUpperCase().trim();

                    // ⚠️ 현재 DB enum 컬럼에는 NO_SHOW 값이 없어서 저장 시 에러가 발생한다.
                    // 프론트에서 NO_SHOW를 보내더라도 내부적으로는 CANCELED로 저장하고
                    // 노쇼 통계는 별도로 업데이트한다.
                    if ("NO_SHOW".equals(statusStr)) {
                        newStatus = ReservationStatus.CANCELED;
                        isNoShowRequest = true;
                    } else {
                        newStatus = ReservationStatus.valueOf(statusStr);
                    }

                    reservation.setStatus(newStatus);
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Invalid reservation status: " + request.getStatus() + ". Valid values: PENDING, CONFIRMED, CANCELED, NO_SHOW, COMPLETED", e);
                }
            }

            if (StringUtils.hasText(request.getPaymentStatus())) {
                try {
                    String paymentStatusStr = request.getPaymentStatus().toUpperCase().trim();
                    reservation.setPaymentStatus(PaymentStatus.valueOf(paymentStatusStr));
                } catch (IllegalArgumentException e) {
                    throw new RuntimeException("Invalid payment status: " + request.getPaymentStatus(), e);
                }
            }

            // 예약 상태 저장 (통계 업데이트 전에 먼저 저장)
            Reservation savedReservation = reservationRepository.save(reservation);

            // ⭐ 노쇼 상태로 변경 시 고객 및 가게 통계 자동 업데이트
            // oldStatus가 null이거나 NO_SHOW가 아닌 경우에만 처리
            if (isNoShowRequest) {
                boolean shouldUpdate = (oldStatus == null || oldStatus != ReservationStatus.NO_SHOW);
                if (shouldUpdate) {
                    try {
                        updateCustomerAndBusinessOnNoShow(savedReservation);
                    } catch (Exception e) {
                        // 통계 업데이트 실패해도 예약 상태는 이미 변경됨
                        System.err.println("Failed to update customer/business stats on NO_SHOW: " + e.getMessage());
                        e.printStackTrace();
                        // 예외를 다시 throw하지 않음 - 예약 상태 변경은 성공한 것으로 간주
                    }
                }
            }
            // ⭐ 완료 상태로 변경 시 고객 예약 카운트 증가
            // oldStatus가 null이거나 COMPLETED가 아닌 경우에만 처리
            else if (newStatus != null && newStatus == ReservationStatus.COMPLETED) {
                boolean shouldUpdate = (oldStatus == null || oldStatus != ReservationStatus.COMPLETED);
                if (shouldUpdate) {
                    try {
                        updateCustomerAndBusinessOnComplete(savedReservation);
                    } catch (Exception e) {
                        // 통계 업데이트 실패해도 예약 상태는 이미 변경됨
                        System.err.println("Failed to update customer/business stats on COMPLETED: " + e.getMessage());
                        e.printStackTrace();
                        // 예외를 다시 throw하지 않음 - 예약 상태 변경은 성공한 것으로 간주
                    }
                }
            }

            return savedReservation;
        } catch (RuntimeException e) {
            throw e;
        } catch (Exception e) {
            throw new RuntimeException("Failed to update reservation status: " + e.getMessage(), e);
        }
    }

    /**
     * 노쇼 발생 시 고객 및 가게 통계 업데이트
     */
    private void updateCustomerAndBusinessOnNoShow(Reservation reservation) {
        // 1. 고객 노쇼 카운트 증가
        if (reservation.getMemberId() != null) {
            try {
                customerRepository.findById(reservation.getMemberId()).ifPresent(customer -> {
                    try {
                        int currentNoShowCount = customer.getNoShowCount() != null ? customer.getNoShowCount() : 0;
                        customer.setNoShowCount(currentNoShowCount + 1);
                        int newNoShowCount = currentNoShowCount + 1;

                        // 신뢰 점수 계산: 노쇼 횟수에 따라 더 큰 가중치로 감소
                        // 노쇼 횟수가 많을수록 더 많이 감소 (노쇼 횟수 * 15점 감소, 최소 0점)
                        int reservationCount = customer.getReservationCount() != null ? customer.getReservationCount() : 0;
                        
                        // trust_score = 100 - (노쇼횟수 * 큰가중치) + (예약횟수 * 작은가중치)
                        // 노쇼 가중치: 15점, 예약 가중치: 2점
                        int calculatedTrustScore = 100 - (newNoShowCount * 15) + (reservationCount * 2);
                        customer.setTrustScore(Math.max(0, Math.min(100, calculatedTrustScore)));

                        customerRepository.save(customer);
                    } catch (Exception e) {
                        System.err.println("Failed to save customer stats on NO_SHOW: " + e.getMessage());
                        e.printStackTrace();
                        // 저장 실패해도 계속 진행
                    }
                });
            } catch (Exception e) {
                System.err.println("Failed to find customer on NO_SHOW: " + e.getMessage());
                e.printStackTrace();
                // 고객을 찾지 못해도 계속 진행
            }
        }

        // 2. 가게 노쇼 카운트 증가
        if (reservation.getBusinessId() != null) {
            try {
                businessRepository.findById(reservation.getBusinessId()).ifPresent(business -> {
                    try {
                        int currentNoShowCount = business.getNoShowCount() != null ? business.getNoShowCount() : 0;
                        business.setNoShowCount(currentNoShowCount + 1);
                        businessRepository.save(business);
                    } catch (Exception e) {
                        System.err.println("Failed to save business stats on NO_SHOW: " + e.getMessage());
                        e.printStackTrace();
                        // 저장 실패해도 계속 진행
                    }
                });
            } catch (Exception e) {
                System.err.println("Failed to find business on NO_SHOW: " + e.getMessage());
                e.printStackTrace();
                // 가게를 찾지 못해도 계속 진행
            }
        }
    }

    /**
     * 예약 완료 시 고객 및 가게 통계 업데이트
     */
    private void updateCustomerAndBusinessOnComplete(Reservation reservation) {
        // 1. 고객 예약 완료 카운트 증가
        if (reservation.getMemberId() != null) {
            try {
                customerRepository.findById(reservation.getMemberId()).ifPresent(customer -> {
                    try {
                        int currentReservationCount = customer.getReservationCount() != null ? customer.getReservationCount() : 0;
                        customer.setReservationCount(currentReservationCount + 1);
                        int newReservationCount = currentReservationCount + 1;

                        // 신뢰 점수 계산: 예약 횟수에 따라 증가, 노쇼 횟수에 따라 감소
                        // 노쇼 횟수가 더 큰 가중치를 가짐
                        int noShowCount = customer.getNoShowCount() != null ? customer.getNoShowCount() : 0;
                        
                        // trust_score = 100 - (노쇼횟수 * 큰가중치) + (예약횟수 * 작은가중치)
                        // 노쇼 가중치: 15점, 예약 가중치: 2점
                        int calculatedTrustScore = 100 - (noShowCount * 15) + (newReservationCount * 2);
                        customer.setTrustScore(Math.max(0, Math.min(100, calculatedTrustScore)));

                        customerRepository.save(customer);
                    } catch (Exception e) {
                        System.err.println("Failed to save customer stats on COMPLETED: " + e.getMessage());
                        e.printStackTrace();
                        // 저장 실패해도 계속 진행
                    }
                });
            } catch (Exception e) {
                System.err.println("Failed to find customer on COMPLETED: " + e.getMessage());
                e.printStackTrace();
                // 고객을 찾지 못해도 계속 진행
            }
        }

        // 2. 가게 완료 예약 카운트 증가
        if (reservation.getBusinessId() != null) {
            try {
                businessRepository.findById(reservation.getBusinessId()).ifPresent(business -> {
                    try {
                        int currentCompletedCount = business.getCompletedReservations() != null ? business.getCompletedReservations() : 0;
                        business.setCompletedReservations(currentCompletedCount + 1);
                        businessRepository.save(business);
                    } catch (Exception e) {
                        System.err.println("Failed to save business stats on COMPLETED: " + e.getMessage());
                        e.printStackTrace();
                        // 저장 실패해도 계속 진행
                    }
                });
            } catch (Exception e) {
                System.err.println("Failed to find business on COMPLETED: " + e.getMessage());
                e.printStackTrace();
                // 가게를 찾지 못해도 계속 진행
            }
        }
    }

    // -------------------------
    // DELETE
    // -------------------------
    public void deleteReservation(Long id) {
        reservationRepository.deleteById(id);
    }
    // -------------------------
// ⭐ 예약 + 모의 결제 통합 처리 + AI 노쇼 예측
// -------------------------
    public ReservationPaymentResult createWithPayment(ReservationFullPayRequest req) {

        // 1. 예약 엔티티 생성 (사장님 승인 대기 상태)
        Reservation reservation = new Reservation();
        reservation.setMemberId(req.getMemberId());
        reservation.setBusinessId(req.getBusinessId());
    reservation.setPeople(req.getPeople());
    reservation.setReservationTime(java.time.LocalDateTime.parse(req.getReservationTime()));
    reservation.setStatus(ReservationStatus.PENDING);  // ⭐ 사장님 승인 대기

    // 기본적으로 결제 대기
    reservation.setPaymentStatus(PaymentStatus.PENDING);

    // DB 저장
        Reservation savedReservation = reservationRepository.save(reservation);

        Customer customer = customerRepository.findById(req.getMemberId()).orElse(null);
        Business business = businessRepository.findById(req.getBusinessId()).orElse(null);

        // 2. AI 노쇼 예측 호출 (AI 서버 다운 시에도 예약은 정상 진행)
        com.olsaram.backend.dto.ai.AiNoshowRequest aiRequest = buildAiNoshowRequest(savedReservation, req);
        com.olsaram.backend.dto.ai.AiNoshowResponse aiResponse = aiNoshowService.safePredict(aiRequest);

    if (aiResponse != null) {
        // AI 예측 성공 → 결과를 예약 엔티티에 저장
        savedReservation.setAiNoshowProbability(aiResponse.getNoshowProbability());

        if (aiResponse.getPolicyRecommendation() != null) {
            savedReservation.setAiRecommendedPolicy(aiResponse.getPolicyRecommendation().getRecommendedPolicy());
            savedReservation.setAiPolicyReason(aiResponse.getPolicyRecommendation().getReason());
        }

        if (aiResponse.getSuspiciousResult() != null) {
            savedReservation.setAiSuspiciousPattern(aiResponse.getSuspiciousResult().getSuspiciousPattern());
            savedReservation.setAiDetectionReason(aiResponse.getSuspiciousResult().getDetectionReason());
        }

        log.info("AI noshow prediction success probability={}%", aiResponse.getNoshowProbability());
    } else {
        // AI 예측 실패 → AI 컬럼은 null 유지, 예약은 정상 진행
        log.info("AI noshow server response missing; skipping AI fields");
    }

    // 3. 모의 결제 처리 (Payment 엔티티 생성)
        String paymentMethod = StringUtils.hasText(req.getPaymentMethod())
                ? req.getPaymentMethod()
                : "CARD";

        // ⭐ ML 모델을 필수로 사용하여 위험도 계산
        RiskSnapshot paymentSnapshot = applyMlRiskModel(customer, savedReservation, paymentMethod);
        int baseScore = paymentSnapshot.score();
        double riskPercent = paymentSnapshot.percent();
        String riskLevel = paymentSnapshot.level();
        double appliedFeePercent = mapRiskPercentToFeePercent(riskPercent);

        double baseFeeAmount = business != null && business.getReservationFeeAmount() != null
                ? business.getReservationFeeAmount().doubleValue()
                : DEFAULT_BASE_AMOUNT_PER_PERSON;

        int headCount = req.getPeople() > 0 ? req.getPeople() : 1;
        double chargedAmount = Math.max(0.0, baseFeeAmount * (appliedFeePercent / 100.0) * headCount);

        // ⭐ ML 모델 사용 정보 로깅
        log.info("✅ 노쇼 감지 ML 모델 적용 성공 - 예약ID: {}, 위험도 레벨: {}, 위험도 퍼센트: {}%, 위험도 점수: {}, 예약금: {}원",
                savedReservation.getId(), paymentSnapshot.mlModelRiskLevel(), 
                paymentSnapshot.mlModelRiskPercent(), baseScore, chargedAmount);

        com.olsaram.backend.domain.reservation.Payment payment =
                com.olsaram.backend.domain.reservation.Payment.builder()
                        .reservationId(savedReservation.getId())
                        .paymentMethod(req.getPaymentMethod())
                        .amount(chargedAmount)
                        .paidAt(java.time.LocalDateTime.now())
                        .build();

        // PaymentService 사용 (결제 대기 상태로 저장)
        paymentService.createPayment(payment);

        // 4. 결제 대기 상태로 유지 (토스 페이먼츠 결제 승인 후 PAID로 변경)
        savedReservation.setPaymentStatus(PaymentStatus.PENDING);
        // ⭐ 예약 시점 스냅샷 저장 (이후 고객 위험도 변경과 무관하게 유지)
        savedReservation.setRiskScoreSnapshot(baseScore);
        savedReservation.setRiskPercentSnapshot(riskPercent);
        savedReservation.setRiskLevelSnapshot(riskLevel);
        savedReservation.setAppliedFeePercentSnapshot(appliedFeePercent);
        savedReservation.setBaseFeeAmountSnapshot(baseFeeAmount);
        savedReservation.setPaymentAmountSnapshot(chargedAmount);
        // ⭐ ML 모델 결과 저장
        savedReservation.setMlModelUsed(paymentSnapshot.mlModelUsed());
        savedReservation.setMlModelRiskLevel(paymentSnapshot.mlModelRiskLevel());
        savedReservation.setMlModelRiskPercent(paymentSnapshot.mlModelRiskPercent());
        reservationRepository.save(savedReservation);

        return ReservationPaymentResult.builder()
                .reservationId(savedReservation.getId())
                .businessId(savedReservation.getBusinessId())
                .memberId(savedReservation.getMemberId())
                .chargedAmount(chargedAmount)
                .paymentStatus(savedReservation.getPaymentStatus() != null
                        ? savedReservation.getPaymentStatus().name()
                        : PaymentStatus.PAID.name())
                .paymentMethod(req.getPaymentMethod())
                .baseFeeAmount(baseFeeAmount)
                .appliedFeePercent(appliedFeePercent)
                .riskPercent(riskPercent)
                .people(headCount)
                .riskScore(baseScore)
                .riskLevel(riskLevel)
                .mlModelUsed(paymentSnapshot.mlModelUsed())
                .mlModelResult(paymentSnapshot.mlModelResult())
                .mlModelRiskLevel(paymentSnapshot.mlModelRiskLevel())
                .mlModelRiskPercent(paymentSnapshot.mlModelRiskPercent())
                .build();
}

/**
 * AI 노쇼 예측 요청 객체 생성
 */
    private com.olsaram.backend.dto.ai.AiNoshowRequest buildAiNoshowRequest(
            Reservation reservation, ReservationFullPayRequest req) {

    // 고객 정보 조회
    Customer customer = customerRepository.findById(req.getMemberId()).orElse(null);

    // 오늘 예약 목록 조회
    LocalDateTime todayStart = LocalDateTime.now().withHour(0).withMinute(0).withSecond(0);
    LocalDateTime todayEnd = LocalDateTime.now().withHour(23).withMinute(59).withSecond(59);

    List<Reservation> todayReservations = reservationRepository
            .findByBusinessIdAndReservationTimeBetween(req.getBusinessId(), todayStart, todayEnd);

    List<com.olsaram.backend.dto.ai.AiTodayReservationDto> todayReservationDtos = todayReservations.stream()
            .map(r -> com.olsaram.backend.dto.ai.AiTodayReservationDto.builder()
                    .reservationId(r.getId())
                    .reservationTime(r.getReservationTime().toString())
                    .partySize(r.getPeople())
                    .paymentMethod(req.getPaymentMethod())
                    .build())
            .toList();

    boolean isSameDayReservation = reservation.getReservationTime()
            .toLocalDate().equals(LocalDateTime.now().toLocalDate());

    return com.olsaram.backend.dto.ai.AiNoshowRequest.builder()
            .customerId(req.getMemberId())
            .reservationTime(req.getReservationTime())
            .partySize(req.getPeople())
            .paymentMethod(req.getPaymentMethod())
            .customerPastNoshowCount(customer != null ? customer.getNoShowCount() : 0)
            .customerPastReservationCount(customer != null ? customer.getReservationCount() : 0)
            .reservationChangeCount(0)
            .isSameDayReservation(isSameDayReservation ? 1 : 0)
            .todayReservations(todayReservationDtos)
            .build();
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

        // ⭐ ML 모델이 실행된 예약만 필터링 (mlModelUsed가 true인 예약만)
        reservations = reservations.stream()
                .filter(reservation -> reservation.getMlModelUsed() != null && reservation.getMlModelUsed())
                .toList();

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

                    // ⭐ ML 모델 결과를 우선 사용하여 위험도 계산
                    String mlModelRiskLevel = reservation.getMlModelRiskLevel();
                    Double mlModelRiskPercent = reservation.getMlModelRiskPercent();
                    
                    int feeBaseScore;
                    double riskPercent;
                    String riskLevel;
                    double appliedFeePercent;
                    double baseFeeAmount;
                    double paidAmount;

                    // ML 모델 결과가 있으면 ML 모델 결과를 사용
                    if (mlModelRiskLevel != null && mlModelRiskPercent != null) {
                        // ML 모델 결과를 기반으로 계산
                        riskPercent = mlModelRiskPercent;
                        riskLevel = mapMlLabelToLegacyLevel(mlModelRiskLevel, "SAFE");
                        feeBaseScore = clampScore((int) Math.round(100 - riskPercent));
                        appliedFeePercent = mapRiskPercentToFeePercent(riskPercent);
                        
                        // 기본 금액은 스냅샷 또는 비즈니스 설정 사용
                        Double snapshotBaseFee = reservation.getBaseFeeAmountSnapshot();
                        baseFeeAmount = snapshotBaseFee != null
                                ? snapshotBaseFee
                                : (business != null && business.getReservationFeeAmount() != null
                                    ? business.getReservationFeeAmount().doubleValue()
                                    : DEFAULT_BASE_AMOUNT_PER_PERSON);
                        
                        // 결제 금액 계산
                        int headCount = reservation.getPeople() != null ? reservation.getPeople() : 1;
                        double estimatedBaseAmount = baseFeeAmount * headCount;
                        paidAmount = Math.max(0.0, estimatedBaseAmount * (appliedFeePercent / 100.0));
                        
                        log.debug("ML 모델 결과 사용 - 예약ID: {}, ML 레벨: {}, ML 퍼센트: {}%, 위험도 점수: {}, 수수료율: {}%",
                                reservation.getId(), mlModelRiskLevel, mlModelRiskPercent, feeBaseScore, appliedFeePercent);
                    } else {
                        // ML 모델 결과가 없으면 스냅샷 사용 (하지만 이미 필터링되어 있으므로 이 경우는 없어야 함)
                        Integer snapshotScore = reservation.getRiskScoreSnapshot();
                        Double snapshotPercent = reservation.getRiskPercentSnapshot();
                        String snapshotLevel = reservation.getRiskLevelSnapshot();
                        Double snapshotAppliedFee = reservation.getAppliedFeePercentSnapshot();
                        Double snapshotBaseFee = reservation.getBaseFeeAmountSnapshot();
                        Double snapshotPaymentAmount = reservation.getPaymentAmountSnapshot();

                        feeBaseScore = snapshotScore != null
                                ? clampScore(snapshotScore)
                                : (customer != null && customer.getTrustScore() != null
                                    ? clampScore(customer.getTrustScore())
                                    : clampScore(riskCalculationService.calculateRiskScore(customer, reservation)));

                        riskLevel = snapshotLevel != null
                                ? snapshotLevel
                                : riskCalculationService.getRiskLevel(feeBaseScore);

                        baseFeeAmount = snapshotBaseFee != null
                                ? snapshotBaseFee
                                : (business != null && business.getReservationFeeAmount() != null
                                    ? business.getReservationFeeAmount().doubleValue()
                                    : DEFAULT_BASE_AMOUNT_PER_PERSON);

                        riskPercent = snapshotPercent != null
                                ? snapshotPercent
                                : calculateRiskPercent(feeBaseScore);

                        appliedFeePercent = snapshotAppliedFee != null
                                ? snapshotAppliedFee
                                : mapRiskPercentToFeePercent(riskPercent);
                        
                        int headCount = reservation.getPeople() != null ? reservation.getPeople() : 1;
                        double estimatedBaseAmount = baseFeeAmount * headCount;
                        double expectedFeeAmount = Math.max(0.0, estimatedBaseAmount * (appliedFeePercent / 100.0));
                        paidAmount = snapshotPaymentAmount != null ? snapshotPaymentAmount : expectedFeeAmount;
                        
                        log.warn("ML 모델 결과 없음, 스냅샷 사용 - 예약ID: {}", reservation.getId());
                    }

                    List<String> patterns = riskCalculationService.analyzeSuspiciousPatterns(customer, reservation);

                    // 고객 이력 정보 생성
                    ReservationWithRiskResponse.CustomerRiskData customerData = null;
                    if (customer != null) {
                        int accountAgeDays = customer.getCreatedAt() != null
                                ? (int) ChronoUnit.DAYS.between(customer.getCreatedAt().toLocalDate(), LocalDateTime.now().toLocalDate())
                                : 365;

                        // ⭐ 신뢰점수는 ML 모델 기반 위험도 점수를 사용 (ML 모델이 예약 시점의 위험도를 반영)
                        int displayTrustScore = feeBaseScore; // ML 모델 기반 위험도 점수를 신뢰점수로 표시
                        
                        customerData = ReservationWithRiskResponse.CustomerRiskData.builder()
                                .customerId(customer.getCustomerId())
                                .name(customer.getName())
                                .phone(customer.getPhone())
                                .noShowCount(customer.getNoShowCount() != null ? customer.getNoShowCount() : 0)
                                .reservationCount(customer.getReservationCount() != null ? customer.getReservationCount() : 0)
                                .lastMinuteCancels(0) // 추후 구현
                                .accountAgeDays(accountAgeDays)
                                .trustScore(displayTrustScore) // ML 모델 기반 위험도 점수 사용
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
                            .paymentAmount(paidAmount)
                            .baseFeeAmount(baseFeeAmount)
                            .appliedFeePercent(appliedFeePercent)
                            .riskPercent(riskPercent)
                            .customerData(customerData)
                            .riskScore(feeBaseScore)
                            .riskLevel(riskLevel)
                            .suspiciousPatterns(patterns)
                            .aiNoshowProbability(reservation.getAiNoshowProbability())
                            .aiRecommendedPolicy(reservation.getAiRecommendedPolicy())
                            .aiPolicyReason(reservation.getAiPolicyReason())
                            .aiSuspiciousPattern(reservation.getAiSuspiciousPattern())
                            .aiDetectionReason(reservation.getAiDetectionReason())
                            // ⭐ ML 모델 결과 (DB에 저장된 값)
                            .mlModelUsed(reservation.getMlModelUsed())
                            .mlModelRiskLevel(reservation.getMlModelRiskLevel())
                            .mlModelRiskPercent(reservation.getMlModelRiskPercent())
                            .build();
                })
                .sorted(Comparator.comparing(ReservationWithRiskResponse::getRiskScore)) // 위험도 순 정렬
                .toList();
    }

    private double calculateRiskPercent(int riskScore) {
        int normalizedScore = Math.max(0, Math.min(100, riskScore));
        return 100 - normalizedScore; // 점수가 낮을수록 위험도가 높음
    }

    private double mapRiskPercentToFeePercent(double riskPercent) {
        if (riskPercent < 30) return 0.0;          // 0~29.99%
        if (riskPercent < 50) return 10.0;         // 30~49.99%
        if (riskPercent < 70) return 20.0;         // 50~69.99%
        if (riskPercent < 90) return 30.0;         // 70~89.99%
        return 40.0;                               // 90~100%
    }

    private double mapMlLabelToRiskPercent(String label) {
        if (!StringUtils.hasText(label)) return -1;
        String normalized = label.toLowerCase(Locale.ROOT);
        return switch (normalized) {
            case "high" -> 85.0;
            case "medium" -> 55.0;
            case "low" -> 25.0;
            default -> -1;
        };
    }

    private String mapMlLabelToLegacyLevel(String label, String fallback) {
        if (!StringUtils.hasText(label)) return fallback;
        return switch (label.toLowerCase(Locale.ROOT)) {
            case "high" -> "DANGER";
            case "medium" -> "CAUTION";
            case "low" -> "SAFE";
            default -> fallback;
        };
    }

    private int clampScore(Integer score) {
        if (score == null) return 100;
        return Math.max(0, Math.min(100, score));
    }

    /**
     * ⭐ ML 모델을 필수로 사용하여 위험도를 계산합니다.
     * ML 모델이 실패하면 예외를 던집니다.
     */
    private RiskSnapshot applyMlRiskModel(
            Customer customer,
            Reservation reservation,
            String paymentMethod
    ) {
        try {
            Optional<ReservationRiskPrediction> mlPrediction =
                    reservationRiskModelService.predict(customer, reservation, paymentMethod);

            if (mlPrediction.isEmpty()) {
                String errorMsg = String.format(
                        "ML 모델 예측에 실패했습니다. 예약ID: %d, 고객ID: %s, 예약시간: %s. " +
                        "ML 모델 설정이 활성화되어 있는지, Python 스크립트가 정상적으로 실행되는지 확인해주세요.",
                        reservation.getId(),
                        customer != null ? String.valueOf(customer.getCustomerId()) : "null",
                        reservation.getReservationTime() != null ? reservation.getReservationTime().toString() : "null"
                );
                log.error("❌ ML 모델 예측 실패 - {}", errorMsg);
                throw new RuntimeException(errorMsg);
            }

            ReservationRiskPrediction prediction = mlPrediction.get();
            String mlRiskLevel = prediction.getRiskLevel();
            
            if (!StringUtils.hasText(mlRiskLevel)) {
                String errorMsg = String.format(
                        "ML 모델이 유효한 위험도 레벨을 반환하지 않았습니다. 예약ID: %d",
                        reservation.getId()
                );
                log.error("❌ ML 모델 예측 실패 - {}", errorMsg);
                throw new RuntimeException(errorMsg);
            }

            double mlPercent = mapMlLabelToRiskPercent(mlRiskLevel);
            if (mlPercent < 0) {
                String errorMsg = String.format(
                        "ML 모델이 알 수 없는 위험도 레벨을 반환했습니다: %s (예약ID: %d). " +
                        "예상되는 값: high, medium, low",
                        mlRiskLevel, reservation.getId()
                );
                log.error("❌ ML 모델 예측 실패 - {}", errorMsg);
                throw new RuntimeException(errorMsg);
            }

            double adjustedPercent = Math.max(0, Math.min(100, mlPercent));
            int score = clampScore((int) Math.round(100 - adjustedPercent));
            String level = mapMlLabelToLegacyLevel(mlRiskLevel, "SAFE");
            
            log.info("✅ ML 모델 적용 성공 - 예약ID: {}, 위험도 레벨: {}, 위험도 퍼센트: {}%, 위험도 점수: {}, 결제수단: {}",
                    reservation.getId(), mlRiskLevel, adjustedPercent, score, paymentMethod);
            
            return new RiskSnapshot(score, adjustedPercent, level, true, "SUCCESS", mlRiskLevel, adjustedPercent);
        } catch (RuntimeException e) {
            // 이미 로깅된 예외는 그대로 재던지기
            throw e;
        } catch (Exception e) {
            String errorMsg = String.format(
                    "ML 모델 실행 중 예상치 못한 오류가 발생했습니다. 예약ID: %d, 오류: %s",
                    reservation.getId(), e.getMessage()
            );
            log.error("❌ ML 모델 예측 실패 - {}", errorMsg, e);
            throw new RuntimeException(errorMsg, e);
        }
    }

    private record RiskSnapshot(
            int score, 
            double percent, 
            String level,
            Boolean mlModelUsed,
            String mlModelResult,
            String mlModelRiskLevel,
            Double mlModelRiskPercent
    ) {
    }
}
