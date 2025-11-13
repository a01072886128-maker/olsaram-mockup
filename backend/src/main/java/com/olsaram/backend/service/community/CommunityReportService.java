package com.olsaram.backend.service.community;

import com.olsaram.backend.entity.community.CommunityReport;
import com.olsaram.backend.repository.community.CommunityReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityReportService {

    private final CommunityReportRepository reportRepository;

    public List<CommunityReport> findAll() {
        return reportRepository.findAll();
    }

    public CommunityReport save(CommunityReport report) {
        return reportRepository.save(report);
    }
}
