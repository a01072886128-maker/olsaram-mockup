package com.olsaram.backend.service.community;

import com.olsaram.backend.repository.community.CommunityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CommunityAdminService {

    private final CommunityRepository communityRepository;

    public void deleteReportedPost(Long id) {
        communityRepository.deleteById(id);
    }
}
