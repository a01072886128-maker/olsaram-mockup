package com.olsaram.backend.entity;

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

    // ✅ 예측 결과 저장용 컬럼 추가
    @Column(name = "RISK_SCORE")
    private Double riskScore;  // 예측 점수 (0.0~1.0)

    @Column(name = "LABEL")
    private Integer label;     // 1=노쇼 위험 / 0=정상

    @Column(name = "REASON")
    private String reason;     // 예측 사유
}
