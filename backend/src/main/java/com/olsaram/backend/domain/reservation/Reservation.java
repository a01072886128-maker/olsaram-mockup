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

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
