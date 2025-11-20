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
    @GetMapping("/all")
    public List<Community> getAllUserPosts() {
        return communityService.findByUserCategory(); // USER_POST 만 조회
    }

    /** 📝 일반 사용자 게시글 작성 */
    @PostMapping
    public Community createUserPost(@RequestBody Community community) {
        community.setCategory("USER_POST"); // 카테고리 고정
        return communityService.save(community);
    }

    /** 🔍 단일 게시글 조회 */
    @GetMapping("/{id}")
    public Community getUserPost(@PathVariable Long id) {
        return communityService.findById(id);
    }

    /** ✏ 게시글 수정 */
    @PutMapping("/{id}")
    public Community updateUserPost(
            @PathVariable Long id,
            @RequestBody Community updatedData
    ) {
        Community existing = communityService.findById(id);

        existing.setTitle(updatedData.getTitle());
        existing.setContent(updatedData.getContent());
        existing.setTags(updatedData.getTags());
        existing.setCategory("USER_POST"); // 유지

        return communityService.save(existing); // save = update 처리
    }

    /** ❌ 게시글 삭제 */
    @DeleteMapping("/{id}")
    public void deleteUserPost(@PathVariable Long id) {
        communityService.delete(id);
    }
}
