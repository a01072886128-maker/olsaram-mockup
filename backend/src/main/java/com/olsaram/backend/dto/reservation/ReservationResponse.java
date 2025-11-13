package com.olsaram.backend.dto.reservation;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ReservationResponse {
    private Long id;
    private Long memberId;
    private Long businessId;
    private LocalDateTime reservationTime;
    private String status;
    private String paymentStatus;
}
