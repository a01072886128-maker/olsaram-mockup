package com.olsaram.backend.dto.fraud;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudReportRequest {

    @JsonProperty("reporter_id")
    @NotNull(message = "신고자 ID는 필수입니다.")
    private Long reporterId;

    @JsonProperty("report_type")
    @NotBlank(message = "신고 유형은 필수입니다.")
    private String reportType; // NO_SHOW, RESERVATION_FRAUD, MARKETING_SPAM

    @JsonProperty("phone_number")
    @NotBlank(message = "전화번호는 필수입니다.")
    private String phoneNumber;

    @JsonProperty("incident_date")
    private LocalDateTime incidentDate;

    @JsonProperty("damage_amount")
    private Long damageAmount;

    @NotBlank(message = "피해 내용은 필수입니다.")
    @Size(min = 50, message = "피해 내용은 최소 50자 이상이어야 합니다.")
    private String description;

    @JsonProperty("suspect_info")
    private String suspectInfo;

    @JsonProperty("additional_info")
    private String additionalInfo;

    @JsonProperty("evidence_urls")
    private String evidenceUrls;

    private String region;
}
