package com.olsaram.backend.entity.fraud;

public enum FraudReportStatus {
    PENDING,    // 검토 중 (3건 미만)
    PUBLISHED,  // 공개 (3건 이상)
    REJECTED    // 반려
}
