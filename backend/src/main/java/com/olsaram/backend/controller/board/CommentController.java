package com.olsaram.backend.controller.board;

import com.olsaram.backend.entity.board.Comment;
import com.olsaram.backend.service.board.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comment")
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;

    /** 💬 특정 게시글의 댓글 목록 조회 */
    @GetMapping("/{boardId}")
    public List<Comment> getComments(@PathVariable Long boardId) {
        return commentService.findByBoardId(boardId);
    }

    /** ✍️ 댓글 작성 */
    @PostMapping
    public Comment create(@RequestBody Comment comment) {
        return commentService.save(comment);
    }

    /** ❌ 댓글 삭제 */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        commentService.delete(id);
    }
}
