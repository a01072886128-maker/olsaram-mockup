package com.olsaram.backend.controller.community;

import com.olsaram.backend.entity.community.Comment;
import com.olsaram.backend.service.community.CommunityCommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community/comments")
@RequiredArgsConstructor
public class CommunityCommentController {

    private final CommunityCommentService commentService;

    /** ===========================
     *   🔥 고객 댓글 작성
     *  =========================== */
    @PostMapping("/user")
    public Comment writeUserComment(@RequestBody Comment comment) {
        return commentService.saveComment(
                comment.getCommunityId(),
                comment.getAuthor(),
                comment.getContent(),
                "USER"
        );
    }

    /** ===========================
     *   🔥 사업주 댓글 작성
     *  =========================== */
    @PostMapping("/owner")
    public Comment writeOwnerComment(@RequestBody Comment comment) {
        return commentService.saveComment(
                comment.getCommunityId(),
                comment.getAuthor(),
                comment.getContent(),
                "OWNER"
        );
    }

    /** ===========================
     *   🔥 모든 댓글 조회 (프론트에서 호출)
     *   GET /api/community/comments/{communityId}
     *  =========================== */
    @GetMapping("/{communityId}")
    public List<Comment> getAllComments(@PathVariable Long communityId) {
        return commentService.getComments(communityId, null);  // ⭐ 전체 댓글
    }

    /** ===========================
     *   🔥 고객 댓글 조회
     *  =========================== */
    @GetMapping("/user/{communityId}")
    public List<Comment> getUserComments(@PathVariable Long communityId) {
        return commentService.getComments(communityId, "USER");
    }

    /** ===========================
     *   🔥 사업주 댓글 조회
     *  =========================== */
    @GetMapping("/owner/{communityId}")
    public List<Comment> getOwnerComments(@PathVariable Long communityId) {
        return commentService.getComments(communityId, "OWNER");
    }

    /** ===========================
     *   🗑 댓글 삭제
     *  =========================== */
    @DeleteMapping("/{commentId}")
    public void deleteComment(@PathVariable Long commentId) {
        commentService.deleteComment(commentId);
    }
}
