package com.olsaram.backend.controller;

import com.olsaram.backend.dto.business.BusinessRequestDto;
import com.olsaram.backend.dto.business.BusinessResponse;
import com.olsaram.backend.service.BusinessService;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api")
public class BusinessController {

    private static final Logger log = LoggerFactory.getLogger(BusinessController.class);
    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    /**
     * 로그인한 사업자의 가게 목록 조회
     */
    @GetMapping("/owner/businesses")
    public ResponseEntity<List<BusinessResponse>> getMyBusinesses(@RequestParam Long ownerId) {
        try {
            log.info("가게 목록 조회 요청 - ownerId: {}", ownerId);
            List<BusinessResponse> businesses = businessService.getBusinessesByOwnerId(ownerId);
            log.info("가게 목록 조회 성공 - ownerId: {}, 가게 수: {}", ownerId, businesses.size());
            return ResponseEntity.ok(businesses);

        } catch (Exception e) {
            log.error("가게 목록 조회 실패", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(null);
        }
    }

    /**
     * 새로운 가게 등록
     */
    @PostMapping("/business")
    public ResponseEntity<BusinessResponse> registerBusiness(@Valid @RequestBody BusinessRequestDto requestDto) {
        log.info("가게 등록 요청 - ownerId: {}, businessName: {}",
                requestDto.getOwnerId(), requestDto.getBusinessName());

        BusinessResponse response = businessService.registerBusiness(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * ⭐ 가게 소유자 변경 (테스트용)
     */
    @PatchMapping("/business/{id}/transfer")
    public ResponseEntity<?> transferBusiness(
            @PathVariable Long id,
            @RequestParam Long newOwnerId
    ) {
        try {
            businessService.transferBusinessOwner(id, newOwnerId);
            return ResponseEntity.ok("가게 소유자가 변경되었습니다.");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 가게 정보 수정
     */
    @PutMapping("/business/{id}")
    public ResponseEntity<?> updateBusiness(
            @PathVariable Long id,
            @RequestParam Long ownerId,
            @Valid @RequestBody BusinessRequestDto requestDto
    ) {
        try {
            log.info("가게 수정 요청 - businessId: {}, ownerId: {}", id, ownerId);
            BusinessResponse response = businessService.updateBusiness(id, ownerId, requestDto);
            log.info("가게 수정 성공 - businessId: {}", id);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("가게 수정 실패 - businessId: {}", id, e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * 가게 삭제
     */
    @DeleteMapping("/business/{id}")
    public ResponseEntity<?> deleteBusiness(
            @PathVariable Long id,
            @RequestParam Long ownerId
    ) {
        try {
            log.info("가게 삭제 요청 - businessId: {}, ownerId: {}", id, ownerId);
            businessService.deleteBusiness(id, ownerId);
            log.info("가게 삭제 성공 - businessId: {}", id);
            return ResponseEntity.ok("가게가 삭제되었습니다.");
        } catch (Exception e) {
            log.error("가게 삭제 실패 - businessId: {}", id, e);
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    /**
     * ⭐ 단일 가게 조회 (프론트에서 비즈니스 이름 표시용)
     */
    @GetMapping("/business/{id}")
    public ResponseEntity<?> getBusinessById(@PathVariable Long id) {
        log.info("가게 단일 조회 요청 - businessId: {}", id);

        BusinessResponse response = businessService.getBusinessById(id);

        if (response == null) {
            log.warn("가게 조회 실패 - businessId {} 존재하지 않음", id);
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("가게가 존재하지 않습니다. businessId=" + id);
        }

        log.info("가게 단일 조회 성공 - businessId: {}", id);
        return ResponseEntity.ok(response);
    }
}
