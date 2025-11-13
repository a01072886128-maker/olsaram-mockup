package com.olsaram.backend.entity.noshow;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Getter
@Setter
@Table(name = "noshow_analysis")
public class NoShowAnalysis {

    @Id
    @Column(name = "RESERVATION_ID")
    private String reservationId;

    @Column(name = "CUSTOMER_ID")
    private String customerId;

    @Column(name = "CUSTOMER_NAME")
    private String customerName;  // ✅ 고객 이름

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

    // ✅ 새 확장 필드 추가
    @Column(name = "LOYALTY_GRADE")
    private String loyaltyGrade; // 고객 등급 (GOLD / SILVER / BRONZE)

    @Column(name = "LEAD_TIME_HOURS")
    private Integer leadTimeHours; // 예약 리드타임 (시간 단위)

    @Column(name = "HOLIDAY_FLAG")
    private Integer holidayFlag; // 공휴일 여부 (1=공휴일, 0=평일)

    @Column(name = "REGION")
    private String region; // 지역

    @Column(name = "EVENT_NEARBY")
    private String eventNearby; // 주변 이벤트 여부

    // ✅ 예측 결과 저장용
    @Column(name = "RISK_SCORE")
    private Double riskScore;  // 예측 점수 (0.0~1.0)

    @Column(name = "LABEL")
    private Integer label;     // 0=안전 / 1=보통 / 2=위험

    @Column(name = "REASON")
    private String reason;     // 예측 사유
}
