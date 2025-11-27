package com.olsaram.backend.dto.fraud;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudPhoneSearchResponse {

    @JsonProperty("phone_number")
    private String phoneNumber;

    @JsonProperty("is_reported")
    private Boolean isReported;

    @JsonProperty("report_count")
    private Integer reportCount;

    @JsonProperty("total_damage")
    private Long totalDamage;

    @JsonProperty("severity_level")
    private String severityLevel; // URGENT (5건 이상), WARNING (3-4건), CAUTION (1-2건), SAFE (0건)

    @JsonProperty("severity_label")
    private String severityLabel;

    @JsonProperty("main_report_type")
    private String mainReportType;

    @JsonProperty("last_reported_at")
    private LocalDateTime lastReportedAt;

    @JsonProperty("last_region")
    private String lastRegion;

    private List<FraudReportResponse> reports;

    public static FraudPhoneSearchResponse safe(String phoneNumber) {
        return FraudPhoneSearchResponse.builder()
                .phoneNumber(phoneNumber)
                .isReported(false)
                .reportCount(0)
                .totalDamage(0L)
                .severityLevel("SAFE")
                .severityLabel("안전: 신고 이력이 없습니다")
                .build();
    }
}
