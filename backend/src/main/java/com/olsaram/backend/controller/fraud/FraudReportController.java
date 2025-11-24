package com.olsaram.backend.controller.fraud;

import com.olsaram.backend.dto.fraud.FraudPhoneSearchResponse;
import com.olsaram.backend.dto.fraud.FraudReportRequest;
import com.olsaram.backend.dto.fraud.FraudReportResponse;
import com.olsaram.backend.service.fraud.FraudReportService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/fraud-reports")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class FraudReportController {

    private final FraudReportService fraudReportService;

    /**
     * 신고 등록
     * POST /api/fraud-reports
     */
    @PostMapping
    public ResponseEntity<FraudReportResponse> createReport(
            @Valid @RequestBody FraudReportRequest request
    ) {
        log.info("신고 등록 요청: phone={}, type={}", request.getPhoneNumber(), request.getReportType());
        FraudReportResponse response = fraudReportService.createReport(request);
        return ResponseEntity.ok(response);
    }

    /**
     * 전화번호 조회
     * GET /api/fraud-reports/search?phone=010-1234-5678
     */
    @GetMapping("/search")
    public ResponseEntity<FraudPhoneSearchResponse> searchByPhone(
            @RequestParam String phone
    ) {
        log.info("전화번호 조회: {}", phone);
        FraudPhoneSearchResponse response = fraudReportService.searchByPhone(phone);
        return ResponseEntity.ok(response);
    }

    /**
     * 신고 목록 조회 (필터링, 정렬)
     * GET /api/fraud-reports?sortBy=latest&filterType=NO_SHOW&filterRegion=강남&days=7
     */
    @GetMapping
    public ResponseEntity<List<FraudReportResponse>> getReports(
            @RequestParam(required = false, defaultValue = "latest") String sortBy,
            @RequestParam(required = false) String filterType,
            @RequestParam(required = false) String filterRegion,
            @RequestParam(required = false) Integer days
    ) {
        log.info("신고 목록 조회: sortBy={}, filterType={}, filterRegion={}, days={}",
                sortBy, filterType, filterRegion, days);
        List<FraudReportResponse> reports = fraudReportService.getReports(sortBy, filterType, filterRegion, days);
        return ResponseEntity.ok(reports);
    }

    /**
     * 신고 상세 조회
     * GET /api/fraud-reports/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<FraudReportResponse> getReportDetail(
            @PathVariable Long id
    ) {
        log.info("신고 상세 조회: id={}", id);
        FraudReportResponse response = fraudReportService.getReportDetail(id);
        return ResponseEntity.ok(response);
    }

    /**
     * 추가 신고 (나도 피해입니다)
     * POST /api/fraud-reports/add
     */
    @PostMapping("/add")
    public ResponseEntity<FraudReportResponse> addReport(
            @Valid @RequestBody FraudReportRequest request
    ) {
        log.info("추가 신고: phone={}", request.getPhoneNumber());
        FraudReportResponse response = fraudReportService.addReport(request);
        return ResponseEntity.ok(response);
    }
}
