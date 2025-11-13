package com.olsaram.backend.dto.reservation;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentRequest {
    private Long reservationId;
    private String paymentMethod; // 카드 / 현금 / 제로보증
    private Double amount;
    private LocalDateTime paidAt;
}
