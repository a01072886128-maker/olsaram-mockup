package com.olsaram.backend.service;

import com.olsaram.backend.domain.business.Business;
import com.olsaram.backend.domain.business.BusinessOwner;
import com.olsaram.backend.dto.business.BusinessRequestDto;
import com.olsaram.backend.dto.business.BusinessResponse;
import com.olsaram.backend.repository.BusinessOwnerRepository;
import com.olsaram.backend.repository.BusinessRepository;
import jakarta.transaction.Transactional;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class BusinessService {

    private final BusinessRepository businessRepository;

    private final BusinessOwnerRepository businessOwnerRepository;

    public BusinessService(BusinessRepository businessRepository, BusinessOwnerRepository businessOwnerRepository) {
        this.businessRepository = businessRepository;
        this.businessOwnerRepository = businessOwnerRepository;
    }

    /**
     * 특정 사업자(owner)가 소유한 모든 가게 조회
     */
    public List<BusinessResponse> getBusinessesByOwnerId(Long ownerId) {
        if (ownerId == null) {
            throw new IllegalArgumentException("ownerId는 필수입니다.");
        }

        List<Business> businesses = businessRepository.findByOwner_OwnerId(ownerId);
        return businesses.stream()
                .map(BusinessResponse::from)
                .collect(Collectors.toList());
    }

    @Transactional
    public BusinessResponse registerBusiness(BusinessRequestDto request) {
        if (request.getOwnerId() == null) {
            throw new IllegalArgumentException("owner_id를 입력해주세요.");
        }

        BusinessOwner owner = businessOwnerRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new IllegalArgumentException("등록된 사업자를 찾을 수 없습니다."));

        // 필수 필드 기본값 처리
        String category = (request.getCategory() == null || request.getCategory().trim().isEmpty())
                ? "기타" : request.getCategory();
        String address = (request.getAddress() == null || request.getAddress().trim().isEmpty())
                ? "미등록" : request.getAddress();
        String phone = (request.getPhone() == null || request.getPhone().trim().isEmpty())
                ? "미등록" : request.getPhone();

        Business business = Business.builder()
                .businessName(request.getBusinessName())
                .businessNumber(request.getBusinessNumber())
                .category(category)
                .address(address)
                .phone(phone)
                .description(request.getDescription())
                .businessImageUrl(request.getBusinessImageUrl())
                .openingHours(request.getOpeningHours())
                .build();

        owner.addBusiness(business);
        Business savedBusiness = businessRepository.save(business);

        return BusinessResponse.from(savedBusiness);
    }
}
