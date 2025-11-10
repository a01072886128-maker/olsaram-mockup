package com.olsaram.backend.repository;

import com.olsaram.backend.domain.business.Business;
import com.olsaram.backend.domain.business.BusinessOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {
    List<Business> findByOwner(BusinessOwner owner);
    List<Business> findByOwnerOrderByCreatedAtDesc(BusinessOwner owner);
    List<Business> findByOwnerAndIsActiveTrue(BusinessOwner owner);
    List<Business> findByCategory(String category);
    List<Business> findByIsActiveTrue();

    @Query("SELECT b FROM Business b WHERE " +
           "b.isActive = true AND " +
           "b.latitude BETWEEN :minLat AND :maxLat AND " +
           "b.longitude BETWEEN :minLon AND :maxLon")
    List<Business> findActiveBusinessesByLocation(
        @Param("minLat") BigDecimal minLat,
        @Param("maxLat") BigDecimal maxLat,
        @Param("minLon") BigDecimal minLon,
        @Param("maxLon") BigDecimal maxLon
    );
}
