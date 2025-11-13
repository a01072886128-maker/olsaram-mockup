package com.olsaram.backend.repository;

import com.olsaram.backend.domain.business.Business;
import com.olsaram.backend.domain.business.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    List<Menu> findByBusiness(Business business);
    List<Menu> findByBusinessAndIsAvailableTrue(Business business);
    List<Menu> findByBusinessAndCategory(Business business, String category);
    List<Menu> findByBusinessAndIsPopularTrue(Business business);

    // OCR 관련 메소드
    @Query("SELECT m FROM Menu m " +
           "JOIN FETCH m.business b " +
           "JOIN FETCH b.owner o " +
           "WHERE o.ownerId = :ownerId " +
           "ORDER BY m.createdAt DESC")
    List<Menu> findByOwnerIdOrderByCreatedAtDesc(@Param("ownerId") Long ownerId);

    // 디버그용: businessId로 메뉴 조회
    @Query("SELECT m FROM Menu m " +
           "JOIN FETCH m.business b " +
           "WHERE b.businessId = :businessId " +
           "ORDER BY m.createdAt DESC")
    List<Menu> findByBusinessIdOrderByCreatedAtDesc(@Param("businessId") Long businessId);
}
