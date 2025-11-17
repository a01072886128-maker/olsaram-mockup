package com.olsaram.backend.dto.reservation;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ReservationStatusUpdateRequest {
    private String status;
    private String paymentStatus;
}
