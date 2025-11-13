package com.olsaram.backend.domain.reservation;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long reservationId;
    private String paymentMethod; // 카드 / 현금 / 제로보증
    private Double amount;
    private LocalDateTime paidAt;
}
