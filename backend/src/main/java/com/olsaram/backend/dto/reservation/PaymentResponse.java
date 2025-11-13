package com.olsaram.backend.dto.reservation;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class PaymentResponse {
    private Long id;
    private Long reservationId;
    private String paymentMethod;
    private Double amount;
    private LocalDateTime paidAt;
}
