package com.olsaram.backend.controller.board;

import com.olsaram.backend.entity.board.Notice;
import com.olsaram.backend.service.board.NoticeService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notice")
@RequiredArgsConstructor
public class NoticeController {

    private final NoticeService noticeService;

    /** 📋 공지 목록 조회 */
    @GetMapping
    public List<Notice> list() {
        return noticeService.findAll();
    }

    /** 📝 공지 등록 */
    @PostMapping
    public Notice create(@RequestBody Notice notice) {
        return noticeService.save(notice);
    }

    /** 🔍 공지 상세 조회 */
    @GetMapping("/{id}")
    public Notice getNotice(@PathVariable Long id) {
        Notice notice = noticeService.findById(id);
        if (notice == null) {
            throw new RuntimeException("해당 공지를 찾을 수 없습니다. id=" + id);
        }
        return notice;
    }

    /** ❌ 공지 삭제 */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        noticeService.delete(id);
    }
}
