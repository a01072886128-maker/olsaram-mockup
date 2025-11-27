package com.olsaram.backend.dto.reservation;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class ReservationPaymentResult {
    private Long reservationId;
    private Long businessId;
    private Long memberId;

    private Double chargedAmount;
    private String paymentStatus;
    private String paymentMethod;

    private Double baseFeeAmount;
    private Double appliedFeePercent;
    private Double riskPercent;
    private Integer people;
    private Integer riskScore;
    private String riskLevel;
}
