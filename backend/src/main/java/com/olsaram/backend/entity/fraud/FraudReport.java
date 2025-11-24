package com.olsaram.backend.entity.fraud;

import com.olsaram.backend.domain.business.BusinessOwner;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "fraud_report")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FraudReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "report_id")
    private Long reportId;

    // 신고자 (소상공인)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "reporter_id", nullable = false)
    private BusinessOwner reporter;

    // 신고 유형: NO_SHOW, RESERVATION_FRAUD, MARKETING_SPAM
    @Enumerated(EnumType.STRING)
    @Column(name = "report_type", nullable = false, length = 30)
    private FraudReportType reportType;

    // 신고 전화번호 (마스킹 전 원본)
    @Column(name = "phone_number", nullable = false, length = 20)
    private String phoneNumber;

    // 피해 발생 일시
    @Column(name = "incident_date")
    private LocalDateTime incidentDate;

    // 피해 금액 (원)
    @Column(name = "damage_amount")
    private Long damageAmount;

    // 피해 내용 (최소 50자)
    @Column(name = "description", nullable = false, columnDefinition = "TEXT")
    private String description;

    // 예약자 정보 (이름, 예약 인원 등)
    @Column(name = "suspect_info", length = 500)
    private String suspectInfo;

    // 추가 설명
    @Column(name = "additional_info", columnDefinition = "TEXT")
    private String additionalInfo;

    // 증거 파일 URL (콤마로 구분)
    @Column(name = "evidence_urls", columnDefinition = "TEXT")
    private String evidenceUrls;

    // 지역 (예: 서울 강남구)
    @Column(name = "region", length = 100)
    private String region;

    // 신고 상태: PENDING(검토중), PUBLISHED(공개), REJECTED(반려)
    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private FraudReportStatus status = FraudReportStatus.PENDING;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;
}
