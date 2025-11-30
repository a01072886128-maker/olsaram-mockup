package com.olsaram.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "toss.payment")
public class TossPaymentProperties {
    /**
     * 토스 페이먼츠 테스트용 시크릿 키
     * 테스트 모드: test_gsk_... (결제 위젯용)
     */
    private String secretKey = "test_gsk_docs_OaPz8L5KdmQXkzRz3y47BMw6";

    /**
     * 토스 페이먼츠 API 기본 URL
     */
    private String apiUrl = "https://api.tosspayments.com/v1";

    /**
     * 테스트 모드 활성화 여부
     */
    private boolean testMode = true;
}

