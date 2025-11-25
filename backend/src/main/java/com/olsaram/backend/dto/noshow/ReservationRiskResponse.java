package com.olsaram.backend.dto.noshow;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * 예약별 위험도 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReservationRiskResponse {

    private Long reservationId;           // 예약 ID
    private String riskLevel;             // 위험도 등급 (HIGH, MEDIUM, LOW)
    private Integer riskScore;            // 위험도 점수 (0~100, 낮을수록 위험)
    private String reason;                // 위험도 판정 이유
    private List<String> riskFactors;     // 위험 요소 리스트

    // 고객 정보
    private Long customerId;
    private String customerName;
    private Integer customerNoShowCount;  // 고객의 과거 노쇼 횟수
    private Integer customerTrustScore;   // 고객 신뢰도

    // 예약 정보
    private String reservationTime;
    private Integer people;
    private String paymentStatus;
}
