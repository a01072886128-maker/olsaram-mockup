package com.olsaram.backend.controller.board;

import com.olsaram.backend.entity.board.Comment;
import com.olsaram.backend.service.board.CommentService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/comments")   // 복수형 변경
@RequiredArgsConstructor
public class CommentController {

    private final CommentService commentService;   // 🔥 반드시 추가

    @GetMapping("/{boardId}")
    public List<Comment> getComments(@PathVariable Long boardId) {
        return commentService.findByBoardId(boardId);
    }

    @PostMapping
    public Comment create(@RequestBody Comment comment) {
        return commentService.save(comment);
    }

    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        commentService.delete(id);
    }
}
