package com.olsaram.backend.repository;

import com.olsaram.backend.entity.NoShowAnalysis;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NoShowAnalysisRepository extends JpaRepository<NoShowAnalysis, String> {
}
