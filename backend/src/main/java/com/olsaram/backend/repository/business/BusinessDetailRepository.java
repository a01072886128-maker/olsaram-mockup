package com.olsaram.backend.repository.business;

import com.olsaram.backend.domain.business.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessDetailRepository extends JpaRepository<Business, Long> {
    Optional<Business> findByBusinessName(String businessName);
}
