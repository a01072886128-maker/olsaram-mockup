package com.olsaram.backend.repository;

import com.olsaram.backend.domain.business.Business;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BusinessRepository extends JpaRepository<Business, Long> {
    List<Business> findByOwner_OwnerId(Long ownerId);
}
