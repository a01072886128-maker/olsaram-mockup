package com.olsaram.backend.dto.fraud;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.olsaram.backend.entity.fraud.FraudReport;
import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudReportResponse {

    @JsonProperty("report_id")
    private Long reportId;

    @JsonProperty("reporter_id")
    private Long reporterId;

    @JsonProperty("reporter_name")
    private String reporterName;

    @JsonProperty("report_type")
    private String reportType;

    @JsonProperty("report_type_label")
    private String reportTypeLabel;

    @JsonProperty("phone_number")
    private String phoneNumber; // 마스킹된 번호

    @JsonProperty("phone_number_raw")
    private String phoneNumberRaw; // 원본 번호 (관리자용)

    @JsonProperty("incident_date")
    private LocalDateTime incidentDate;

    @JsonProperty("damage_amount")
    private Long damageAmount;

    private String description;

    @JsonProperty("suspect_info")
    private String suspectInfo;

    @JsonProperty("additional_info")
    private String additionalInfo;

    @JsonProperty("evidence_urls")
    private String evidenceUrls;

    private String region;

    private String status;

    @JsonProperty("status_label")
    private String statusLabel;

    @JsonProperty("created_at")
    private LocalDateTime createdAt;

    // 집계 정보
    @JsonProperty("report_count")
    private Integer reportCount;

    @JsonProperty("total_damage")
    private Long totalDamage;

    @JsonProperty("severity_level")
    private String severityLevel; // URGENT, WARNING, SAFE

    public static FraudReportResponse from(FraudReport report) {
        return FraudReportResponse.builder()
                .reportId(report.getReportId())
                .reporterId(report.getReporter().getOwnerId())
                .reporterName(report.getReporter().getName())
                .reportType(report.getReportType().name())
                .reportTypeLabel(getReportTypeLabel(report.getReportType().name()))
                .phoneNumber(maskPhoneNumber(report.getPhoneNumber()))
                .phoneNumberRaw(report.getPhoneNumber())
                .incidentDate(report.getIncidentDate())
                .damageAmount(report.getDamageAmount())
                .description(report.getDescription())
                .suspectInfo(report.getSuspectInfo())
                .additionalInfo(report.getAdditionalInfo())
                .evidenceUrls(report.getEvidenceUrls())
                .region(report.getRegion())
                .status(report.getStatus().name())
                .statusLabel(getStatusLabel(report.getStatus().name()))
                .createdAt(report.getCreatedAt())
                .build();
    }

    // 전화번호 마스킹: 010-1234-5678 -> 010-12**-**78
    public static String maskPhoneNumber(String phone) {
        if (phone == null || phone.length() < 10) return phone;

        String cleaned = phone.replaceAll("-", "");
        if (cleaned.length() == 11) {
            return cleaned.substring(0, 3) + "-" +
                   cleaned.substring(3, 5) + "**-**" +
                   cleaned.substring(9, 11);
        }
        return phone;
    }

    private static String getReportTypeLabel(String type) {
        return switch (type) {
            case "NO_SHOW" -> "노쇼";
            case "RESERVATION_FRAUD" -> "예약 사기";
            case "MARKETING_SPAM" -> "마케팅 스팸";
            default -> type;
        };
    }

    private static String getStatusLabel(String status) {
        return switch (status) {
            case "PENDING" -> "검토 중";
            case "PUBLISHED" -> "공개";
            case "REJECTED" -> "반려";
            default -> status;
        };
    }
}
