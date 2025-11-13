package com.olsaram.backend.service.community;

import com.olsaram.backend.entity.community.Community;
import com.olsaram.backend.repository.community.CommunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CommunityService {

    private final CommunityRepository communityRepository;

    /** 🧾 전체 커뮤니티 목록 조회 */
    public List<Community> findAll() {
        return communityRepository.findAll();
    }

    /** 📝 게시글 작성 */
    public Community save(Community community) {
        return communityRepository.save(community);
    }

    /** 🔍 게시글 단건 조회 */
    public Community findById(Long id) {
        return communityRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Community not found with id: " + id));
    }

    /** ❌ 게시글 삭제 */
    public void delete(Long id) {
        communityRepository.deleteById(id);
    }

    /** 👥 일반 사용자용 게시글 조회 */
    public List<Community> findByUserCategory() {
        return communityRepository.findByCategory("USER_POST");
    }

    /** 🏢 사업자용 게시글 조회 */
    public List<Community> findByOwnerCategory() {
        return communityRepository.findByCategory("OWNER_POST");
    }
}
