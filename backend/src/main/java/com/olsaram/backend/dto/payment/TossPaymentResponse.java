package com.olsaram.backend.dto.payment;

import lombok.Builder;
import lombok.Getter;

import java.time.LocalDateTime;

@Getter
@Builder
public class TossPaymentResponse {
    private String paymentKey;
    private String orderId;
    private String orderName;
    private String status;
    private Long totalAmount;
    private String method;
    private LocalDateTime approvedAt;
    private String failureReason;
}

