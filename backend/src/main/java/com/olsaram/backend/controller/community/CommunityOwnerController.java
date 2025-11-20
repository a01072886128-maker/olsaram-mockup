package com.olsaram.backend.controller.community;

import com.olsaram.backend.dto.community.CommunityRequest;
import com.olsaram.backend.entity.community.Community;
import com.olsaram.backend.service.community.CommunityService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community/owner")
@RequiredArgsConstructor
public class CommunityOwnerController {

    private final CommunityService communityService;

    /** 📋 사업자용 전체 게시글 조회 */
   @GetMapping("/all")
    public List<Community> getAllPostsForOwner() {
        return communityService.findByOwnerCategory();  // ✔ 정답
    }



    /** 📰 사업자 게시글 등록 (+ tags, category, 저장) */
    @PostMapping
    public ResponseEntity<?> createPost(@RequestBody CommunityRequest request) {
        return ResponseEntity.ok(communityService.createPost(request));
    }

    /** 🔍 단일 게시글 조회 */
    @GetMapping("/{id}")
    public Community getOwnerPost(@PathVariable Long id) {
        return communityService.findById(id);
    }

    /** 🗑️ 게시글 삭제 */
    @DeleteMapping("/{id}")
    public void deleteOwnerPost(@PathVariable Long id) {
        communityService.delete(id);
    }

    /** 👀 조회수 증가 */
    @PostMapping("/{id}/view")
    public void increaseView(@PathVariable Long id) {
        communityService.increaseViews(id);
    }

    /** 👍 좋아요 증가 */
    @PostMapping("/{id}/like")
    public void increaseLike(@PathVariable Long id) {
        communityService.increaseLikes(id);
    }
    /** ✏ 게시글 수정 */
    @PutMapping("/{id}")
    public ResponseEntity<?> updatePost(
            @PathVariable Long id,
            @RequestBody CommunityRequest request
    ) {
        return ResponseEntity.ok(communityService.updatePost(id, request));
    }

}
