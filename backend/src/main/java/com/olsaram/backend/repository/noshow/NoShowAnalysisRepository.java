package com.olsaram.backend.repository.noshow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.olsaram.backend.entity.noshow.NoShowAnalysis;

@Repository
public interface NoShowAnalysisRepository extends JpaRepository<NoShowAnalysis, String> {
}
