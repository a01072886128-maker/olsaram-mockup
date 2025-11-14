package com.olsaram.backend.repository.business;

import com.olsaram.backend.domain.business.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface MapBusinessRepository extends JpaRepository<Business, Long> {

    // 비즈니스 이름으로 단건 조회
    Optional<Business> findByBusinessName(String businessName);

    // 활성화된 가게만 좌표 범위로 조회
    @Query("""
        SELECT b
        FROM DomainBusiness b
        WHERE b.isActive = true
          AND b.latitude BETWEEN :minLat AND :maxLat
          AND b.longitude BETWEEN :minLon AND :maxLon
    """)
    List<Business> findActiveBusinessesByLocation(
            @Param("minLat") BigDecimal minLat,
            @Param("maxLat") BigDecimal maxLat,
            @Param("minLon") BigDecimal minLon,
            @Param("maxLon") BigDecimal maxLon
    );
}
