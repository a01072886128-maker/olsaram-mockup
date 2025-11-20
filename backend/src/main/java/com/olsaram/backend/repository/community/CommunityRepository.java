package com.olsaram.backend.repository.community;

import com.olsaram.backend.entity.community.Community;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface CommunityRepository extends JpaRepository<Community, Long> {

    List<Community> findByCategory(String category);

    /** 👁 조회수 증가 */
    @Modifying
    @Transactional
    @Query("UPDATE Community c SET c.views = c.views + 1 WHERE c.id = :id")
    void increaseViews(Long id);

    /** ❤️ 좋아요 증가 */
    @Modifying
    @Transactional
    @Query("UPDATE Community c SET c.likes = c.likes + 1 WHERE c.id = :id")
    void increaseLikes(Long id);
}
