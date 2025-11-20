package com.olsaram.backend.dto.reservation;

import lombok.Data;

@Data
public class ReservationFullPayRequest {
    private Long memberId;
    private Long businessId;
    private String reservationTime;
    private int people;
    private String paymentMethod;
}
