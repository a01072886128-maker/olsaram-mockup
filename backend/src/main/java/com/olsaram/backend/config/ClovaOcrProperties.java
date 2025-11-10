package com.olsaram.backend.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "ncloud.ocr")
public class ClovaOcrProperties {

    /**
     * NAVER Cloud API Gateway invoke URL for the CLOVA OCR model.
     */
    private String invokeUrl;

    /**
     * API Gateway key ID (X-NCP-APIGW-API-KEY-ID).
     */
    private String apiKeyId;

    /**
     * API Gateway key (X-NCP-APIGW-API-KEY).
     */
    private String apiKey;

    /**
     * OCR secret key (X-OCR-SECRET).
     */
    private String secretKey;

    public String getInvokeUrl() {
        return invokeUrl;
    }

    public void setInvokeUrl(String invokeUrl) {
        this.invokeUrl = invokeUrl;
    }

    public String getApiKeyId() {
        return apiKeyId;
    }

    public void setApiKeyId(String apiKeyId) {
        this.apiKeyId = apiKeyId;
    }

    public String getApiKey() {
        return apiKey;
    }

    public void setApiKey(String apiKey) {
        this.apiKey = apiKey;
    }

    public String getSecretKey() {
        return secretKey;
    }

    public void setSecretKey(String secretKey) {
        this.secretKey = secretKey;
    }

    public boolean isConfigured() {
        return invokeUrl != null && !invokeUrl.isBlank()
                && secretKey != null && !secretKey.isBlank();
    }
}
