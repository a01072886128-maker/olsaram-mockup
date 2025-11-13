package com.olsaram.backend.entity.noshow;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Entity
@Table(name = "reservation_data")
@Getter
@Setter
@NoArgsConstructor
public class ReservationData {

    @Id
    @Column(name = "RESERVATION_ID")
    private String reservationId;

    @Column(name = "CUSTOMER_ID")
    private String customerId;

    @Column(name = "CUSTOMER_NAME")
    private String customerName;

    @Column(name = "DATE_TIME")
    private String dateTime;

    @Column(name = "AMOUNT")
    private Double amount;

    @Column(name = "VISIT_HISTORY")
    private Integer visitHistory;

    @Column(name = "CANCEL_COUNT")
    private Integer cancelCount;

    @Column(name = "NOSHOW_HISTORY")
    private Integer noshowHistory;

    @Column(name = "PAYMENT_PATTERN")
    private String paymentPattern;

    @Column(name = "BEHAVIOR_NOTE")
    private String behaviorNote;

    @Column(name = "LOYALTY_GRADE")
    private String loyaltyGrade;

    @Column(name = "LEAD_TIME_HOURS")
    private Integer leadTimeHours;

    @Column(name = "HOLIDAY_FLAG")
    private Integer holidayFlag;

    @Column(name = "REGION")
    private String region;

    @Column(name = "EVENT_NEARBY")
    private String eventNearby;

    // ✅ 추가된 필드 (AI 예측 결과 저장용)
    @Column(name = "RISK_SCORE")
    private Double riskScore; // 0.0 ~ 1.0 예측 확률

    @Column(name = "LABEL")
    private Integer label; // 1=노쇼 위험 / 0=정상

    @Column(name = "REASON", columnDefinition = "TEXT")
    private String reason; // 예측 사유
}
