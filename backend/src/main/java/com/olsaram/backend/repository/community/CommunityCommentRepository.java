package com.olsaram.backend.repository.community;

import com.olsaram.backend.entity.community.Comment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface CommunityCommentRepository extends JpaRepository<Comment, Long> {

    /** 전체 댓글 조회 */
    List<Comment> findByCommunityId(Long communityId);

    /** 특정 게시글 + 커뮤니티 유형(USER/OWNER) 댓글 조회 */
    List<Comment> findByCommunityIdAndCommunityType(Long communityId, String communityType);
}
