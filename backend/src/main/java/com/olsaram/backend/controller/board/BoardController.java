package com.olsaram.backend.controller.board;

import com.olsaram.backend.dto.board.BoardRequestDto;
import com.olsaram.backend.dto.board.BoardResponseDto;
import com.olsaram.backend.entity.board.Board;
import com.olsaram.backend.service.board.BoardService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/board")
@RequiredArgsConstructor
public class BoardController {

    private final BoardService boardService;

    /**
     * 📋 게시글 전체 조회
     */
    @GetMapping
    public List<BoardResponseDto> list() {
        return boardService.findAll()
                .stream()
                .map(board -> new BoardResponseDto(
                        board.getId(),
                        board.getTitle(),
                        board.getContent(),
                        board.getAuthor()
                ))
                .collect(Collectors.toList());
    }

    /**
     * 📝 게시글 등록
     */
    @PostMapping
    public BoardResponseDto create(@RequestBody BoardRequestDto dto) {
        Board board = Board.builder()
                .title(dto.getTitle())
                .content(dto.getContent())
                .author(dto.getAuthor())
                .build();

        Board saved = boardService.save(board);
        return new BoardResponseDto(
                saved.getId(),
                saved.getTitle(),
                saved.getContent(),
                saved.getAuthor()
        );
    }

    /**
     * ❌ 게시글 삭제
     */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        boardService.delete(id);
    }
}
