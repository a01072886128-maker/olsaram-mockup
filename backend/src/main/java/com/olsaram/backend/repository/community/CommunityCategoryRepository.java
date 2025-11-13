package com.olsaram.backend.repository.community;

import com.olsaram.backend.entity.community.CommunityCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CommunityCategoryRepository extends JpaRepository<CommunityCategory, Long> {
}
