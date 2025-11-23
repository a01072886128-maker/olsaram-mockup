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

    public BusinessService(BusinessRepository businessRepository,
                           BusinessOwnerRepository businessOwnerRepository) {
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

    /**
     * ⭐ 단일 가게 조회 (404 방지)
     * 존재하지 않으면 null 반환
     */
    public BusinessResponse getBusinessById(Long businessId) {
        if (businessId == null) return null;

        return businessRepository.findById(businessId)
                .map(BusinessResponse::from)
                .orElse(null);
    }

    /**
     * ⭐ 가게 소유자 변경 (테스트용)
     */
    @Transactional
    public void transferBusinessOwner(Long businessId, Long newOwnerId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("가게를 찾을 수 없습니다."));

        BusinessOwner newOwner = businessOwnerRepository.findById(newOwnerId)
                .orElseThrow(() -> new IllegalArgumentException("사업자를 찾을 수 없습니다."));

        business.setOwner(newOwner);
        businessRepository.save(business);
    }

    /**
     * 가게 정보 수정
     */
    @Transactional
    public BusinessResponse updateBusiness(Long businessId, Long ownerId, BusinessRequestDto request) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("가게를 찾을 수 없습니다."));

        // 소유자 확인
        if (!business.getOwner().getOwnerId().equals(ownerId)) {
            throw new IllegalArgumentException("해당 가게의 소유자가 아닙니다.");
        }

        // 필드 업데이트
        if (request.getBusinessName() != null && !request.getBusinessName().trim().isEmpty()) {
            business.setBusinessName(request.getBusinessName().trim());
        }
        if (request.getBusinessNumber() != null) {
            business.setBusinessNumber(request.getBusinessNumber().trim());
        }
        if (request.getCategory() != null && !request.getCategory().trim().isEmpty()) {
            business.setCategory(request.getCategory().trim());
        }
        if (request.getAddress() != null) {
            business.setAddress(request.getAddress().trim());
        }
        if (request.getPhone() != null) {
            business.setPhone(request.getPhone().trim());
        }
        if (request.getDescription() != null) {
            business.setDescription(request.getDescription().trim());
        }
        if (request.getBusinessImageUrl() != null) {
            business.setBusinessImageUrl(request.getBusinessImageUrl().trim());
        }
        if (request.getOpeningHours() != null) {
            business.setOpeningHours(request.getOpeningHours().trim());
        }

        Business savedBusiness = businessRepository.save(business);
        return BusinessResponse.from(savedBusiness);
    }

    /**
     * 가게 삭제
     */
    @Transactional
    public void deleteBusiness(Long businessId, Long ownerId) {
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("가게를 찾을 수 없습니다."));

        // 소유자 확인
        if (!business.getOwner().getOwnerId().equals(ownerId)) {
            throw new IllegalArgumentException("해당 가게의 소유자가 아닙니다.");
        }

        businessRepository.delete(business);
    }

    /**
     * 가게 등록
     */
    @Transactional
    public BusinessResponse registerBusiness(BusinessRequestDto request) {

        if (request.getOwnerId() == null) {
            throw new IllegalArgumentException("owner_id를 입력해주세요.");
        }

        BusinessOwner owner = businessOwnerRepository.findById(request.getOwnerId())
                .orElseThrow(() -> new IllegalArgumentException("등록된 사업자를 찾을 수 없습니다."));

        // 기본값 처리
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
