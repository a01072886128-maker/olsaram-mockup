package com.olsaram.backend.service.noshow;

import com.olsaram.backend.domain.customer.Customer;
import com.olsaram.backend.domain.reservation.Reservation;
import com.olsaram.backend.dto.noshow.ReservationRiskResponse;
import com.olsaram.backend.repository.CustomerRepository;
import com.olsaram.backend.repository.reservation.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

/**
 * 예약별 위험도 계산 서비스 (룰 기반 MVP)
 *
 * 향후 확장:
 * - 이 서비스를 인터페이스로 추상화하여, NoShowAiService와 교체 가능하도록 설계
 * - 예: IRiskCalculator 인터페이스 생성 → RuleBasedRiskCalculator, AiBasedRiskCalculator 구현
 */
@Service
@RequiredArgsConstructor
public class ReservationRiskService {

    private final ReservationRepository reservationRepository;
    private final CustomerRepository customerRepository;

    /**
     * 예약별 위험도 계산 (룰 기반)
     *
     * @param reservationId 예약 ID
     * @return 위험도 응답 DTO
     */
    public ReservationRiskResponse calculateReservationRisk(Long reservationId) {

        // 예약 정보 조회
        Reservation reservation = reservationRepository.findById(reservationId)
                .orElseThrow(() -> new RuntimeException("Reservation not found (id=" + reservationId + ")"));

        // 고객 정보 조회
        Customer customer = null;
        if (reservation.getMemberId() != null) {
            customer = customerRepository.findById(reservation.getMemberId()).orElse(null);
        }

        // 위험도 계산 로직 실행
        return calculateRisk(reservation, customer);
    }

    /**
     * 위험도 계산 로직 (비즈니스 룰 기반)
     */
    private ReservationRiskResponse calculateRisk(Reservation reservation, Customer customer) {

        List<String> riskFactors = new ArrayList<>();
        int riskScore = 100; // 기본 점수 (100 = 안전, 0 = 매우 위험)
        String riskLevel = "LOW";
        String reason = "정상 예약";

        // 고객이 없는 경우 (비회원)
        if (customer == null) {
            riskScore = 50;
            riskLevel = "MEDIUM";
            reason = "고객 정보 없음 (비회원)";
            riskFactors.add("고객 정보 없음");
        } else {

            int noShowCount = customer.getNoShowCount() != null ? customer.getNoShowCount() : 0;
            int reservationCount = customer.getReservationCount() != null ? customer.getReservationCount() : 0;

            // 규칙 1: 노쇼 이력이 3회 이상 → HIGH
            if (noShowCount >= 3) {
                riskScore -= 50;
                riskLevel = "HIGH";
                reason = "고객의 과거 노쇼 이력 " + noShowCount + "회 (높은 위험)";
                riskFactors.add("노쇼 이력 " + noShowCount + "회");
            }
            // 규칙 2: 노쇼 이력 2회 → MEDIUM~HIGH
            else if (noShowCount == 2) {
                riskScore -= 30;
                riskLevel = "HIGH";
                reason = "고객의 과거 노쇼 이력 2회";
                riskFactors.add("노쇼 이력 2회");
            }
            // 규칙 3: 노쇼 이력 1회 → MEDIUM
            else if (noShowCount == 1) {
                riskScore -= 20;
                riskLevel = "MEDIUM";
                reason = "고객의 과거 노쇼 이력 1회";
                riskFactors.add("노쇼 이력 1회");
            }

            // 신뢰 점수는 별도 저장하지 않고 위험도(100-신뢰)로 표현하므로 제외

            // 규칙 5: 신규 고객 (예약 이력 없음)
            if (reservationCount == 0) {
                riskScore -= 10;
                riskFactors.add("첫 예약 (이력 없음)");
                if (riskLevel.equals("LOW")) {
                    riskLevel = "MEDIUM";
                    reason = "신규 고객 (첫 예약)";
                }
            }

            // 규칙 6: 야간 예약 (18시~23시) + 노쇼 이력 1회 이상 → 위험도 증가
            if (reservation.getReservationTime() != null) {
                int hour = reservation.getReservationTime().getHour();
                if (hour >= 18 && hour <= 23 && noShowCount >= 1) {
                    riskScore -= 10;
                    riskFactors.add("야간 예약 (18~23시) + 노쇼 이력");
                    if (riskLevel.equals("LOW")) {
                        riskLevel = "MEDIUM";
                        reason = "야간 예약 + 노쇼 이력";
                    }
                }
            }

            // 규칙 7: 대규모 인원 (8명 이상) + 신규 고객
            if (reservation.getPeople() != null && reservation.getPeople() >= 8 && reservationCount == 0) {
                riskScore -= 15;
                riskFactors.add("대규모 인원 (" + reservation.getPeople() + "명) + 신규 고객");
                if (riskLevel.equals("LOW")) {
                    riskLevel = "MEDIUM";
                    reason = "대규모 인원 + 신규 고객";
                }
            }

            // 규칙 8: 결제 완료 시 위험도 감소
            if (reservation.getPaymentStatus() != null
                && reservation.getPaymentStatus().name().equals("PAID")) {
                riskScore += 10;
                riskFactors.add("선결제 완료 (위험도 감소)");
            }

            // 규칙 9: VIP 고객 (예약 10회 이상 + 노쇼 0회)
            if (reservationCount >= 10 && noShowCount == 0) {
                riskScore += 20;
                riskLevel = "LOW";
                reason = "신뢰 고객 (VIP)";
                riskFactors.clear();
                riskFactors.add("VIP 고객 (예약 " + reservationCount + "회, 노쇼 0회)");
            }
        }

        // 점수 범위 보정 (0~100)
        riskScore = Math.max(0, Math.min(100, riskScore));

        // 최종 등급 재조정 (점수 기반)
        if (riskScore >= 70) {
            riskLevel = "LOW";
        } else if (riskScore >= 40) {
            riskLevel = "MEDIUM";
        } else {
            riskLevel = "HIGH";
        }

        return ReservationRiskResponse.builder()
                .reservationId(reservation.getId())
                .riskLevel(riskLevel)
                .riskScore(riskScore)
                .reason(reason)
                .riskFactors(riskFactors)
                .customerId(customer != null ? customer.getCustomerId() : null)
                .customerName(customer != null ? customer.getName() : "비회원")
                .customerNoShowCount(customer != null ? customer.getNoShowCount() : 0)
                .customerTrustScore(customer != null ? customer.getTrustScore() : 0)
                .reservationTime(reservation.getReservationTime() != null
                        ? reservation.getReservationTime().toString() : null)
                .people(reservation.getPeople())
                .paymentStatus(reservation.getPaymentStatus() != null
                        ? reservation.getPaymentStatus().name() : null)
                .build();
    }

    /**
     * 여러 예약의 위험도 일괄 계산
     */
    public List<ReservationRiskResponse> calculateBatchRisk(List<Long> reservationIds) {
        return reservationIds.stream()
                .map(this::calculateReservationRisk)
                .toList();
    }
}
