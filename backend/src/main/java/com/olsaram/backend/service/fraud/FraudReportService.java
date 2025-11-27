package com.olsaram.backend.service.fraud;

import com.olsaram.backend.domain.business.BusinessOwner;
import com.olsaram.backend.dto.fraud.FraudPhoneSearchResponse;
import com.olsaram.backend.dto.fraud.FraudReportRequest;
import com.olsaram.backend.dto.fraud.FraudReportResponse;
import com.olsaram.backend.entity.fraud.FraudReport;
import com.olsaram.backend.entity.fraud.FraudReportStatus;
import com.olsaram.backend.entity.fraud.FraudReportType;
import com.olsaram.backend.repository.BusinessOwnerRepository;
import com.olsaram.backend.repository.fraud.FraudReportRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class FraudReportService {

    private final FraudReportRepository fraudReportRepository;
    private final BusinessOwnerRepository businessOwnerRepository;

    /**
     * 신고 등록
     */
    @Transactional
    public FraudReportResponse createReport(FraudReportRequest request) {
        // 신고자 조회
        BusinessOwner reporter = businessOwnerRepository.findById(request.getReporterId())
                .orElseThrow(() -> new IllegalArgumentException("신고자를 찾을 수 없습니다."));

        // 전화번호 정규화 (하이픈 제거)
        String normalizedPhone = normalizePhoneNumber(request.getPhoneNumber());

        // 신고 엔티티 생성
        FraudReport report = FraudReport.builder()
                .reporter(reporter)
                .reportType(FraudReportType.valueOf(request.getReportType()))
                .phoneNumber(normalizedPhone)
                .incidentDate(request.getIncidentDate())
                .damageAmount(request.getDamageAmount())
                .description(request.getDescription())
                .suspectInfo(request.getSuspectInfo())
                .additionalInfo(request.getAdditionalInfo())
                .evidenceUrls(request.getEvidenceUrls())
                .region(request.getRegion())
                .status(FraudReportStatus.PENDING)
                .build();

        FraudReport saved = fraudReportRepository.save(report);

        // 해당 번호의 신고 건수 확인 후 상태 업데이트
        updatePhoneReportStatus(normalizedPhone);

        return buildResponseWithAggregation(saved);
    }

    /**
     * 전화번호 조회
     */
    @Transactional(readOnly = true)
    public FraudPhoneSearchResponse searchByPhone(String phoneNumber) {
        log.info("========== 신고 전화번호 조회 시작 ==========");
        log.info("입력된 전화번호: {}", phoneNumber);

        String normalizedPhone = normalizePhoneNumber(phoneNumber);
        log.info("정규화된 전화번호: {}", normalizedPhone);

        List<FraudReport> reports = fraudReportRepository.findByPhoneNumber(normalizedPhone);
        log.info("조회된 신고 건수: {}", reports.size());

        if (!reports.isEmpty()) {
            for (FraudReport report : reports) {
                log.info("  - 신고 ID: {}, DB 전화번호: {}, 상태: {}",
                         report.getReportId(), report.getPhoneNumber(), report.getStatus());
            }
        }

        if (reports.isEmpty()) {
            log.info("신고 이력 없음 - SAFE 응답 반환");
            return FraudPhoneSearchResponse.safe(FraudReportResponse.maskPhoneNumber(normalizedPhone));
        }

        Long totalDamage = reports.stream()
                .mapToLong(r -> r.getDamageAmount() != null ? r.getDamageAmount() : 0)
                .sum();

        // 주요 신고 유형 (가장 많은)
        Map<FraudReportType, Long> typeCounts = reports.stream()
                .collect(Collectors.groupingBy(FraudReport::getReportType, Collectors.counting()));
        String mainType = typeCounts.entrySet().stream()
                .max(Map.Entry.comparingByValue())
                .map(e -> e.getKey().name())
                .orElse("NO_SHOW");

        // 최근 신고
        FraudReport latest = reports.get(0);
        for (FraudReport r : reports) {
            if (r.getCreatedAt().isAfter(latest.getCreatedAt())) {
                latest = r;
            }
        }

        String severityLevel = getSeverityLevel(reports.size());
        String severityLabel = getSeverityLabel(severityLevel, reports.size());

        List<FraudReportResponse> reportResponses = reports.stream()
                .map(this::buildResponseWithAggregation)
                .collect(Collectors.toList());

        return FraudPhoneSearchResponse.builder()
                .phoneNumber(FraudReportResponse.maskPhoneNumber(normalizedPhone))
                .isReported(true)
                .reportCount(reports.size())
                .totalDamage(totalDamage)
                .severityLevel(severityLevel)
                .severityLabel(severityLabel)
                .mainReportType(mainType)
                .lastReportedAt(latest.getCreatedAt())
                .lastRegion(latest.getRegion())
                .reports(reportResponses)
                .build();
    }

    /**
     * 신고 목록 조회 (필터링)
     */
    @Transactional(readOnly = true)
    public List<FraudReportResponse> getReports(String sortBy, String filterType, String filterRegion, Integer days) {
        List<FraudReport> reports;

        // 기간 필터
        if (days != null && days > 0) {
            LocalDateTime after = LocalDateTime.now().minusDays(days);
            reports = fraudReportRepository.findByCreatedAtAfterOrderByCreatedAtDesc(after);
        } else {
            reports = fraudReportRepository.findAll();
        }

        // 유형 필터
        if (filterType != null && !filterType.isEmpty() && !filterType.equals("ALL")) {
            FraudReportType type = FraudReportType.valueOf(filterType);
            reports = reports.stream()
                    .filter(r -> r.getReportType() == type)
                    .collect(Collectors.toList());
        }

        // 지역 필터
        if (filterRegion != null && !filterRegion.isEmpty()) {
            reports = reports.stream()
                    .filter(r -> r.getRegion() != null && r.getRegion().contains(filterRegion))
                    .collect(Collectors.toList());
        }

        // 공개된 것만 (PUBLISHED) 또는 검토중 포함
        reports = reports.stream()
                .filter(r -> r.getStatus() == FraudReportStatus.PUBLISHED || r.getStatus() == FraudReportStatus.PENDING)
                .collect(Collectors.toList());

        // 번호별 집계
        Map<String, List<FraudReport>> groupedByPhone = reports.stream()
                .collect(Collectors.groupingBy(FraudReport::getPhoneNumber));

        List<FraudReportResponse> result = new ArrayList<>();
        for (Map.Entry<String, List<FraudReport>> entry : groupedByPhone.entrySet()) {
            List<FraudReport> phoneReports = entry.getValue();
            FraudReport latest = phoneReports.stream()
                    .max((a, b) -> a.getCreatedAt().compareTo(b.getCreatedAt()))
                    .orElse(phoneReports.get(0));

            Long totalDamage = phoneReports.stream()
                    .mapToLong(r -> r.getDamageAmount() != null ? r.getDamageAmount() : 0)
                    .sum();

            FraudReportResponse response = FraudReportResponse.from(latest);
            response.setReportCount(phoneReports.size());
            response.setTotalDamage(totalDamage);
            response.setSeverityLevel(getSeverityLevel(phoneReports.size()));

            result.add(response);
        }

        // 정렬
        if ("damage".equals(sortBy)) {
            result.sort((a, b) -> Long.compare(b.getTotalDamage(), a.getTotalDamage()));
        } else if ("count".equals(sortBy)) {
            result.sort((a, b) -> Integer.compare(b.getReportCount(), a.getReportCount()));
        } else {
            // 기본: 최신순
            result.sort((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()));
        }

        return result;
    }

    /**
     * 추가 신고 (같은 번호에 대해)
     */
    @Transactional
    public FraudReportResponse addReport(FraudReportRequest request) {
        return createReport(request);
    }

    /**
     * 신고 상세 조회
     */
    @Transactional(readOnly = true)
    public FraudReportResponse getReportDetail(Long reportId) {
        FraudReport report = fraudReportRepository.findById(reportId)
                .orElseThrow(() -> new IllegalArgumentException("신고를 찾을 수 없습니다."));
        return buildResponseWithAggregation(report);
    }

    // === Private Methods ===

    private void updatePhoneReportStatus(String phoneNumber) {
        Long count = fraudReportRepository.countByPhoneNumber(phoneNumber);
        if (count >= 3) {
            List<FraudReport> reports = fraudReportRepository.findByPhoneNumber(phoneNumber);
            for (FraudReport r : reports) {
                if (r.getStatus() == FraudReportStatus.PENDING) {
                    r.setStatus(FraudReportStatus.PUBLISHED);
                    fraudReportRepository.save(r);
                }
            }
        }
    }

    private FraudReportResponse buildResponseWithAggregation(FraudReport report) {
        List<FraudReport> allReports = fraudReportRepository.findByPhoneNumber(report.getPhoneNumber());

        Long totalDamage = allReports.stream()
                .mapToLong(r -> r.getDamageAmount() != null ? r.getDamageAmount() : 0)
                .sum();

        FraudReportResponse response = FraudReportResponse.from(report);
        response.setReportCount(allReports.size());
        response.setTotalDamage(totalDamage);
        response.setSeverityLevel(getSeverityLevel(allReports.size()));

        return response;
    }

    private String normalizePhoneNumber(String phone) {
        if (phone == null) return null;
        return phone.replaceAll("-", "").replaceAll(" ", "");
    }

    private String getSeverityLevel(int count) {
        if (count >= 5) return "URGENT";
        if (count >= 3) return "WARNING";
        return "SAFE";
    }

    private String getSeverityLabel(String level, int count) {
        return switch (level) {
            case "URGENT" -> "긴급: 이 번호는 " + count + "건의 신고 이력이 있습니다";
            case "WARNING" -> "주의: 이 번호는 " + count + "건의 신고 이력이 있습니다";
            default -> "안전: 신고 이력이 없습니다";
        };
    }
}
