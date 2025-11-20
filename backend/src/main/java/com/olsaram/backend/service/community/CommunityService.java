package com.olsaram.backend.service.community;

import com.olsaram.backend.dto.community.CommunityRequest;
import com.olsaram.backend.entity.community.Community;
import com.olsaram.backend.repository.community.CommunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;

    /** 전체 조회 */
    public List<Community> findAll() {
        return communityRepository.findAll();
    }

    /** 단건 조회 */
    public Community findById(Long id) {
        return communityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Community not found with id: " + id));
    }

    /** 삭제 */
    public void delete(Long id) {
        communityRepository.deleteById(id);
    }

    /** ───────────────────────────────
     *  일반 사용자 글 조회
     * ─────────────────────────────── */
    public List<Community> findByUserCategory() {
        return communityRepository.findByCategory("USER_POST");
    }

    /** ───────────────────────────────
     *  사업자 글 조회
     * ─────────────────────────────── */
    public List<Community> findByOwnerCategory() {
        return communityRepository.findByCategory("OWNER_POST");
    }

    /** 조회수 증가 */
    public void increaseViews(Long id) {
        Community c = findById(id);
        c.setViews(c.getViews() + 1);
        communityRepository.save(c);
    }

    /** 좋아요 증가 */
    public void increaseLikes(Long id) {
        Community c = findById(id);
        c.setLikes(c.getLikes() + 1);
        communityRepository.save(c);
    }

    /** ───────────────────────────────
     *  글 생성 (태그 포함)
     * ─────────────────────────────── */
    public Community createPost(CommunityRequest req) {
        Community c = new Community();

        c.setTitle(req.getTitle());
        c.setContent(req.getContent());
        c.setCategory(req.getCategory());
        c.setMemberId(req.getMemberId());
        c.setTags(req.getTags()); // 태그 저장

        return communityRepository.save(c);
    }

    /** ───────────────────────────────
     *  글 수정
     * ─────────────────────────────── */
    public Community updatePost(Long id, CommunityRequest req) {
        Community post = findById(id);

        post.setTitle(req.getTitle());
        post.setContent(req.getContent());
        post.setCategory(req.getCategory());
        post.setTags(req.getTags());
        post.setMemberId(req.getMemberId());

        return communityRepository.save(post);
    }

    /** ───────────────────────────────
     *  ❗ 빠졌던 save(Community) 복구!
     * ─────────────────────────────── */
    public Community save(Community community) {
        return communityRepository.save(community);
    }
}
