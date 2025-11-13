package com.olsaram.backend.dto.reservation;

import lombok.*;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class ReservationRequest {
    private Long memberId;
    private Long businessId;
    private LocalDateTime reservationTime;
    private String status;         // 예약 상태 (대기, 확정, 취소)
    private String paymentStatus;  // 결제 여부
}
