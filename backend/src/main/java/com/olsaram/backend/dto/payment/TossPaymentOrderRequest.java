package com.olsaram.backend.dto.payment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TossPaymentOrderRequest {
    private Long reservationId;
    private Long amount;
    private String orderName;
    private String customerName;
    private String customerEmail;
}

