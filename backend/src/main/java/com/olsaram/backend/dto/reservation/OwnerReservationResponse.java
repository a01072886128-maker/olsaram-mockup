package com.olsaram.backend.dto.reservation;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerReservationResponse {

    private Long id;
    private Long businessId;
    private String businessName;
    private String businessAddress;

    private Long memberId;
    private String customerName;

    private Integer people;              // ⭐ 추가된 부분

    private LocalDateTime reservationTime;

    private String status;
    private String paymentStatus;
}
