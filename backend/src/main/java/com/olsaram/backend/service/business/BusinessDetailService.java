package com.olsaram.backend.service.business;

import com.olsaram.backend.dto.map.BusinessDetailResponse;
import com.olsaram.backend.repository.business.BusinessDetailRepository;
import com.olsaram.backend.domain.business.Business; // ✅ domain 버전

import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class BusinessDetailService {

    private final BusinessDetailRepository businessDetailRepository;

    public BusinessDetailResponse getBusinessDetail(String name) {
        Business business = businessDetailRepository.findByBusinessName(name)
                .orElseThrow(() -> new IllegalArgumentException("가게 정보를 찾을 수 없습니다."));

        return BusinessDetailResponse.builder()
                .name(business.getBusinessName())
                .address(business.getAddress())
                .phone(business.getPhone())
                .description(business.getDescription())
                .lat(business.getLatitude().doubleValue())
                .lng(business.getLongitude().doubleValue())
                .build();
    }
}
