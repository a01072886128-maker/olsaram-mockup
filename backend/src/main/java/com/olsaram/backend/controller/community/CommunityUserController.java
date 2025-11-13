package com.olsaram.backend.controller.community;

import com.olsaram.backend.entity.community.Community;
import com.olsaram.backend.service.community.CommunityService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/community/user")
@RequiredArgsConstructor
public class CommunityUserController {

    private final CommunityService communityService;

    /** 👥 일반 사용자용 전체 게시글 조회 */
    @GetMapping
    public List<Community> getAllUserPosts() {
        return communityService.findByUserCategory();
    }

    /** 📝 일반 사용자용 게시글 작성 */
    @PostMapping
    public Community createUserPost(@RequestBody Community community) {
        community.setCategory("USER_POST"); // 카테고리 지정
        return communityService.save(community);
    }

    /** 🔍 단일 게시글 조회 */
    @GetMapping("/{id}")
    public Community getUserPost(@PathVariable Long id) {
        return communityService.findById(id);
    }

    /** ❌ 게시글 삭제 */
    @DeleteMapping("/{id}")
    public void deleteUserPost(@PathVariable Long id) {
        communityService.delete(id);
    }
}
