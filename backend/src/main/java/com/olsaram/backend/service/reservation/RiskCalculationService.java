package com.olsaram.backend.service.reservation;

import com.olsaram.backend.domain.customer.Customer;
import com.olsaram.backend.domain.reservation.Reservation;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class RiskCalculationService {

    /**
     * 노쇼 위험도 점수 계산 (0~100점)
     * 점수가 낮을수록 위험함
     */
    public int calculateRiskScore(Customer customer, Reservation reservation) {
        int score = 100;

        if (customer == null) return score;

        // 1. 노쇼 이력 벌점 (최대 -50점)
        int noshowCount = customer.getNoShowCount() != null ? customer.getNoShowCount() : 0;
        int noshowPenalty = Math.min(noshowCount * 15, 50);
        score -= noshowPenalty;

        // 2. 예약 대비 노쇼 비율 (최대 -20점)
        int totalReservations = customer.getReservationCount() != null ? customer.getReservationCount() : 0;
        if (totalReservations > 0) {
            double noshowRate = (double) noshowCount / totalReservations;
            if (noshowRate > 0.5) score -= 20;
            else if (noshowRate > 0.3) score -= 15;
            else if (noshowRate > 0.1) score -= 10;
        }

        // 3. 선결제 여부
        boolean hasPrepaid = reservation != null &&
                reservation.getPaymentStatus() != null &&
                "PAID".equals(reservation.getPaymentStatus().name());
        if (hasPrepaid) {
            score += 10;
        } else {
            score -= 5;
        }

        // 4. 신규 고객 여부 (최대 -10점)
        int accountAgeDays = calculateAccountAgeDays(customer.getCreatedAt());
        if (accountAgeDays < 7 && totalReservations == 0) {
            score -= 10;
        }

        // 5. 대규모 예약 패턴 (최대 -10점)
        int partySize = reservation != null && reservation.getPeople() != null ? reservation.getPeople() : 0;
        if (partySize >= 8 && totalReservations == 0) {
            score -= 10;
        }

        // 6. 성실 고객 보너스 (최대 +15점)
        if (noshowCount == 0 && totalReservations >= 10) {
            score += 15;
        } else if (noshowCount == 0 && totalReservations >= 5) {
            score += 10;
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * 점수에 따른 위험도 등급 반환
     */
    public String getRiskLevel(int score) {
        if (score >= 70) return "SAFE";
        else if (score >= 40) return "CAUTION";
        else return "DANGER";
    }

    /**
     * 위험 요소 분석
     */
    public List<String> analyzeSuspiciousPatterns(Customer customer, Reservation reservation) {
        List<String> patterns = new ArrayList<>();

        if (customer == null) return patterns;

        int noshowCount = customer.getNoShowCount() != null ? customer.getNoShowCount() : 0;
        int totalReservations = customer.getReservationCount() != null ? customer.getReservationCount() : 0;
        int accountAgeDays = calculateAccountAgeDays(customer.getCreatedAt());
        int partySize = reservation != null && reservation.getPeople() != null ? reservation.getPeople() : 0;

        if (noshowCount > 0) {
            patterns.add(String.format("타 가게 노쇼 이력 %d회 발견", noshowCount));
        }

        if (accountAgeDays < 7) {
            patterns.add(String.format("가입 %d일차 신규 고객", accountAgeDays));
        }

        if (totalReservations == 0) {
            patterns.add("예약 이력 없음 (첫 예약)");
        }

        if (partySize >= 8 && totalReservations == 0) {
            patterns.add(String.format("첫 예약인데 %d인 대규모 예약", partySize));
        }

        if (totalReservations > 0) {
            double noshowRate = (double) noshowCount / totalReservations;
            if (noshowRate > 0.3) {
                patterns.add(String.format("노쇼 비율 %.0f%%로 높음", noshowRate * 100));
            }
        }

        return patterns;
    }

    /**
     * 자동 조치 사항 분석
     */
    public List<String> getAutoActions(String riskLevel, Reservation reservation) {
        List<String> actions = new ArrayList<>();

        boolean hasPrepaid = reservation != null &&
                reservation.getPaymentStatus() != null &&
                "PAID".equals(reservation.getPaymentStatus().name());

        if (hasPrepaid) {
            actions.add("예약금 선결제 완료");
        }

        if ("DANGER".equals(riskLevel)) {
            actions.add("신분증 인증 요청 발송됨");
            actions.add("예약 1시간 전 재확인 알림 예약됨");
        }

        return actions;
    }

    /**
     * 가입일로부터 경과 일수 계산
     */
    private int calculateAccountAgeDays(LocalDateTime createdAt) {
        if (createdAt == null) return 365; // 기본값: 오래된 계정으로 취급
        return (int) ChronoUnit.DAYS.between(createdAt.toLocalDate(), LocalDateTime.now().toLocalDate());
    }
}
