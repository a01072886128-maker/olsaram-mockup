package com.olsaram.backend.controller.community;

import com.olsaram.backend.entity.community.Community;
import com.olsaram.backend.service.community.CommunityService;
import lombok.RequiredArgsConstructor;
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
        return communityService.findByOwnerCategory();
    }

    /** 📰 홍보/공지 게시글 등록 (사업자용) */
    @PostMapping
    public Community createOwnerPost(@RequestBody Community community) {
        community.setCategory("OWNER_POST");  // 카테고리 구분
        return communityService.save(community);
    }

    /** 🔍 단일 게시글 조회 */
    @GetMapping("/{id}")
    public Community getOwnerPost(@PathVariable Long id) {
        return communityService.findById(id);
    }

    /** 🗑️ 게시글 삭제 (사업자용) */
    @DeleteMapping("/{id}")
    public void deleteOwnerPost(@PathVariable Long id) {
        communityService.delete(id);
    }
}
