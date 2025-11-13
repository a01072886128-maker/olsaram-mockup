package com.olsaram.backend.repository.community;

import com.olsaram.backend.entity.community.CommunityReport;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityReportRepository extends JpaRepository<CommunityReport, Long> {
}
