package com.olsaram.backend.domain.reservation;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Reservation {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long memberId;       // 고객 ID
    private Long businessId;     // 가게 ID

    private Integer people;          // 예약 인원

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime reservationTime;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime createdAt;

    @JsonFormat(pattern = "yyyy-MM-dd'T'HH:mm:ss")
    private LocalDateTime canceledAt;

    @Enumerated(EnumType.STRING)
    private ReservationStatus status;    // PENDING, CONFIRMED, CANCELED

    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus; // UNPAID, PAID, REFUND

    // AI 노쇼 예측 결과
    @Column(name = "ai_noshow_probability")
    private Double aiNoshowProbability;

    @Column(name = "ai_recommended_policy", length = 500)
    private String aiRecommendedPolicy;

    @Column(name = "ai_policy_reason", length = 1000)
    private String aiPolicyReason;

    @Column(name = "ai_suspicious_pattern", length = 500)
    private String aiSuspiciousPattern;

    @Column(name = "ai_detection_reason", length = 1000)
    private String aiDetectionReason;

    // 예약 시점 위험도/요금 스냅샷 (이후 고객 위험도 변경에 영향받지 않도록 고정)
    private Integer riskScoreSnapshot;          // 0~100 점수 (100 안전)
    private Double riskPercentSnapshot;         // 0~100 퍼센트 (높을수록 위험)
    private String riskLevelSnapshot;           // LOW / MEDIUM / HIGH
    private Double appliedFeePercentSnapshot;   // 위험도 기반 수수료율
    private Double baseFeeAmountSnapshot;       // 1인 기준 기본 금액 스냅샷
    private Double paymentAmountSnapshot;       // 결제 금액 스냅샷

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
