package com.olsaram.backend.domain.reservation;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Reservation {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long memberId;
    private Long businessId;

    private LocalDateTime reservationTime;
    private String status; // 예약 상태 (대기, 확정, 취소 등)

    private String paymentStatus; // 결제 여부
}
