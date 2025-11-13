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

    @Column(name = "PHONE_NUMBER")
    private String phoneNumber;

    @Column(name = "DATE_TIME")
    private String dateTime;

    @Column(name = "PARTY_SIZE")
    private Integer partySize;

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

    // AI 결과 저장
    @Column(name = "RISK_SCORE")
    private Double riskScore;

    @Column(name = "LABEL")
    private Integer label;

    @Column(name = "REASON", columnDefinition = "TEXT")
    private String reason;
}
