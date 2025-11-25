package com.olsaram.backend.controller;

import com.olsaram.backend.domain.business.BusinessOwner;
import com.olsaram.backend.dto.owner.OwnerProfileResponse;
import com.olsaram.backend.dto.owner.UpdateOwnerRequest;
import com.olsaram.backend.repository.BusinessOwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/owners")
@RequiredArgsConstructor
public class OwnerController {

    private final BusinessOwnerRepository ownerRepository;

    /**
     * 사업자 프로필 조회
     * GET /api/owners/{ownerId}
     */
    @GetMapping("/{ownerId}")
    public ResponseEntity<?> getOwnerProfile(@PathVariable Long ownerId) {
        try {
            BusinessOwner owner = ownerRepository.findById(ownerId)
                    .orElseThrow(() -> new IllegalArgumentException("사업자를 찾을 수 없습니다."));

            OwnerProfileResponse response = OwnerProfileResponse.builder()
                    .ownerId(owner.getOwnerId())
                    .loginId(owner.getLoginId())
                    .name(owner.getName())
                    .phone(owner.getPhone())
                    .email(owner.getEmail())
                    .profileImageUrl(owner.getProfileImageUrl())
                    .businessNumber(owner.getBusinessNumber())
                    .isVerified(owner.getIsVerified())
                    .subscriptionPlan(owner.getSubscriptionPlan())
                    .maxBusinessCount(owner.getMaxBusinessCount())
                    .totalBusinessCount(owner.getTotalBusinessCount())
                    .totalRevenue(owner.getTotalRevenue())
                    .createdAt(owner.getCreatedAt())
                    .build();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "프로필 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 사업자 정보 수정
     * PUT /api/owners/{ownerId}
     */
    @PutMapping("/{ownerId}")
    public ResponseEntity<?> updateOwnerProfile(
            @PathVariable Long ownerId,
            @RequestBody UpdateOwnerRequest request) {
        try {
            BusinessOwner owner = ownerRepository.findById(ownerId)
                    .orElseThrow(() -> new IllegalArgumentException("사업자를 찾을 수 없습니다."));

            // 수정 가능한 필드만 업데이트
            if (request.getName() != null && !request.getName().trim().isEmpty()) {
                owner.setName(request.getName());
            }
            if (request.getPhone() != null && !request.getPhone().trim().isEmpty()) {
                // 전화번호 중복 체크
                if (ownerRepository.existsByPhoneAndOwnerIdNot(request.getPhone(), ownerId)) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "이미 사용 중인 전화번호입니다.");
                    return ResponseEntity.status(400).body(error);
                }
                owner.setPhone(request.getPhone());
            }
            if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
                // 이메일 중복 체크
                if (ownerRepository.existsByEmailAndOwnerIdNot(request.getEmail(), ownerId)) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "이미 사용 중인 이메일입니다.");
                    return ResponseEntity.status(400).body(error);
                }
                owner.setEmail(request.getEmail());
            }
            if (request.getProfileImageUrl() != null) {
                owner.setProfileImageUrl(request.getProfileImageUrl());
            }
            if (request.getBusinessNumber() != null && !request.getBusinessNumber().trim().isEmpty()) {
                // 사업자번호 중복 체크
                if (ownerRepository.existsByBusinessNumberAndOwnerIdNot(request.getBusinessNumber(), ownerId)) {
                    Map<String, String> error = new HashMap<>();
                    error.put("message", "이미 사용 중인 사업자번호입니다.");
                    return ResponseEntity.status(400).body(error);
                }
                owner.setBusinessNumber(request.getBusinessNumber());
            }

            BusinessOwner updated = ownerRepository.save(owner);

            OwnerProfileResponse response = OwnerProfileResponse.builder()
                    .ownerId(updated.getOwnerId())
                    .loginId(updated.getLoginId())
                    .name(updated.getName())
                    .phone(updated.getPhone())
                    .email(updated.getEmail())
                    .profileImageUrl(updated.getProfileImageUrl())
                    .businessNumber(updated.getBusinessNumber())
                    .isVerified(updated.getIsVerified())
                    .subscriptionPlan(updated.getSubscriptionPlan())
                    .maxBusinessCount(updated.getMaxBusinessCount())
                    .totalBusinessCount(updated.getTotalBusinessCount())
                    .totalRevenue(updated.getTotalRevenue())
                    .createdAt(updated.getCreatedAt())
                    .build();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "정보 수정 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
