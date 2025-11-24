package com.olsaram.backend.repository.fraud;

import com.olsaram.backend.entity.fraud.FraudReport;
import com.olsaram.backend.entity.fraud.FraudReportStatus;
import com.olsaram.backend.entity.fraud.FraudReportType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface FraudReportRepository extends JpaRepository<FraudReport, Long> {

    // 전화번호로 신고 목록 조회
    List<FraudReport> findByPhoneNumber(String phoneNumber);

    // 전화번호로 신고 건수 조회
    Long countByPhoneNumber(String phoneNumber);

    // 전화번호로 총 피해액 조회
    @Query("SELECT COALESCE(SUM(f.damageAmount), 0) FROM FraudReport f WHERE f.phoneNumber = :phoneNumber")
    Long sumDamageAmountByPhoneNumber(@Param("phoneNumber") String phoneNumber);

    // 상태별 조회
    List<FraudReport> findByStatusOrderByCreatedAtDesc(FraudReportStatus status);

    // 유형별 조회
    List<FraudReport> findByReportTypeOrderByCreatedAtDesc(FraudReportType reportType);

    // 지역별 조회
    List<FraudReport> findByRegionContainingOrderByCreatedAtDesc(String region);

    // 기간별 조회
    List<FraudReport> findByCreatedAtAfterOrderByCreatedAtDesc(LocalDateTime after);

    // 신고 건수가 많은 번호 조회 (집계)
    @Query("SELECT f.phoneNumber, COUNT(f), COALESCE(SUM(f.damageAmount), 0) " +
           "FROM FraudReport f " +
           "WHERE f.status = :status " +
           "GROUP BY f.phoneNumber " +
           "ORDER BY COUNT(f) DESC")
    List<Object[]> findTopReportedPhones(@Param("status") FraudReportStatus status);

    // 피해액 큰 순으로 조회
    @Query("SELECT f.phoneNumber, COUNT(f), COALESCE(SUM(f.damageAmount), 0) " +
           "FROM FraudReport f " +
           "WHERE f.status = :status " +
           "GROUP BY f.phoneNumber " +
           "ORDER BY SUM(f.damageAmount) DESC")
    List<Object[]> findTopDamagePhones(@Param("status") FraudReportStatus status);

    // 최신 신고 조회 (공개된 것만)
    List<FraudReport> findByStatusOrderByCreatedAtDesc(FraudReportStatus status, org.springframework.data.domain.Pageable pageable);

    // 동일 번호 + 동일 신고자 중복 체크
    boolean existsByPhoneNumberAndReporter_OwnerId(String phoneNumber, Long reporterId);

    // 전화번호 패턴 검색 (부분 일치)
    @Query("SELECT DISTINCT f.phoneNumber FROM FraudReport f WHERE f.phoneNumber LIKE %:pattern%")
    List<String> findPhoneNumbersByPattern(@Param("pattern") String pattern);
}
