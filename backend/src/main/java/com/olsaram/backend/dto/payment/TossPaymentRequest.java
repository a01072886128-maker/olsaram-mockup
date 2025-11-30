package com.olsaram.backend.dto.payment;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TossPaymentRequest {
    private Long reservationId;
    private String paymentKey;
    private String orderId;
    private Long amount;
}

