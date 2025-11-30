package com.olsaram.backend.dto.payment;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TossPaymentOrderResponse {
    private String orderId;
    private String orderName;
    private Long amount;
    private String clientKey; // 토스 페이먼츠 클라이언트 키 (테스트용)
    private String customerName;
    private String customerEmail;
}

