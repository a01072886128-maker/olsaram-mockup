package com.olsaram.backend.dto.reservation;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationWithRiskResponse {

    // 예약 기본 정보
    private Long id;
    private Long businessId;
    private String businessName;
    private String businessAddress;
    private Long memberId;
    private String customerName;
    private String customerPhone;
    private LocalDateTime reservationTime;
    private Integer people;
    private String status;
    private String paymentStatus;
    private Double paymentAmount;
    private Double baseFeeAmount;
    private Double appliedFeePercent;
    private Double riskPercent;

    // 고객 이력 정보
    private CustomerRiskData customerData;

    // 위험도 분석 결과
    private Integer riskScore;
    private String riskLevel;  // SAFE, CAUTION, DANGER
    private List<String> suspiciousPatterns;
    private List<String> autoActions;

    // AI 노쇼 예측 결과
    private Double aiNoshowProbability;
    private String aiRecommendedPolicy;
    private String aiPolicyReason;
    private String aiSuspiciousPattern;
    private String aiDetectionReason;

    @Getter
    @Setter
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class CustomerRiskData {
        private Long customerId;
        private String name;
        private String phone;
        private Integer noShowCount;
        private Integer reservationCount;
        private Integer lastMinuteCancels;
        private Integer accountAgeDays;
        private Integer trustScore;
        private String customerGrade;
    }
}
