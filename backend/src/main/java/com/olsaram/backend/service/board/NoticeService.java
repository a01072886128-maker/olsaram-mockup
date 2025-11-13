package com.olsaram.backend.service.board;

import com.olsaram.backend.entity.board.Notice;
import com.olsaram.backend.repository.board.NoticeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class NoticeService {

    private final NoticeRepository noticeRepository;

    /** 📋 모든 공지 목록 조회 */
    public List<Notice> findAll() {
        return noticeRepository.findAll();
    }

    /** 📝 공지 등록 */
    public Notice save(Notice notice) {
        return noticeRepository.save(notice);
    }

    /** 🔍 공지 단건 조회 (Optional → null 반환 처리) */
    public Notice findById(Long id) {
        return noticeRepository.findById(id).orElse(null);
    }

    /** ❌ 공지 삭제 */
    public void delete(Long id) {
        noticeRepository.deleteById(id);
    }
}
