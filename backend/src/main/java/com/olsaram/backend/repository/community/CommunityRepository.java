package com.olsaram.backend.repository.community;

import com.olsaram.backend.entity.community.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunityRepository extends JpaRepository<Community, Long> {
    List<Community> findByCategory(String category);
}
