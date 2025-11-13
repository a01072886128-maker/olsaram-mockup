package com.olsaram.backend.controller.community;

import com.olsaram.backend.entity.community.CommunityReport;
import com.olsaram.backend.service.community.CommunityReportService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community/report")
@RequiredArgsConstructor
public class CommunityReportController {

    private final CommunityReportService reportService;

    /** 🚨 신고 목록 조회 */
    @GetMapping
    public List<CommunityReport> list() {
        return reportService.findAll();
    }

    /** 📢 신고 등록 */
    @PostMapping
    public CommunityReport report(@RequestBody CommunityReport report) {
        return reportService.save(report);
    }
}
