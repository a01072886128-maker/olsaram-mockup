package com.olsaram.backend.service.community;

import com.olsaram.backend.entity.community.Comment;
import com.olsaram.backend.repository.community.CommunityCommentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityCommentService {

    private final CommunityCommentRepository commentRepository;

    /** 댓글 저장 (USER / OWNER 구분) */
    public Comment saveComment(Long communityId, String author, String content, String communityType) {

        Comment comment = new Comment();
        comment.setCommunityId(communityId);
        comment.setAuthor(author);
        comment.setContent(content);
        comment.setCreatedAt(LocalDateTime.now());
        comment.setCommunityType(communityType);

        return commentRepository.save(comment);
    }

    /** 댓글 조회 (전체 / USER / OWNER) */
    public List<Comment> getComments(Long communityId, String communityType) {

        // ⭐ communityType 이 null → 전체 댓글 조회
        if (communityType == null) {
            return commentRepository.findByCommunityId(communityId);
        }

        // ⭐ USER 또는 OWNER 전용
        return commentRepository.findByCommunityIdAndCommunityType(communityId, communityType);
    }

    /** 댓글 삭제 */
    public void deleteComment(Long commentId) {
        commentRepository.deleteById(commentId);
    }
}
