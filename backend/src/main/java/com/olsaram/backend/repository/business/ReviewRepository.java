package com.olsaram.backend.repository.business;

import com.olsaram.backend.domain.business.Review;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReviewRepository extends JpaRepository<Review, Long> {

    List<Review> findByBusinessIdOrderByCreatedAtDesc(Long businessId);
}
