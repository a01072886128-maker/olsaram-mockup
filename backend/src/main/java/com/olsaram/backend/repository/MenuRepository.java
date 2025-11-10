package com.olsaram.backend.repository;

import com.olsaram.backend.domain.business.Business;
import com.olsaram.backend.domain.business.Menu;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MenuRepository extends JpaRepository<Menu, Long> {
    List<Menu> findByBusiness(Business business);
    List<Menu> findByBusinessAndIsAvailableTrue(Business business);
    List<Menu> findByBusinessAndCategory(Business business, String category);
    List<Menu> findByBusinessAndIsPopularTrue(Business business);
}
