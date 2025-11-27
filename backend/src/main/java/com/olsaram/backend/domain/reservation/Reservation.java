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

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
