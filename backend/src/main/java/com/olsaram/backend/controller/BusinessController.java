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
public class BusinessController {

    private static final Logger log = LoggerFactory.getLogger(BusinessController.class);
    private final BusinessService businessService;

    public BusinessController(BusinessService businessService) {
        this.businessService = businessService;
    }

    /**
     * 로그인한 사업자의 가게 목록 조회
     */
    @GetMapping("/api/owner/businesses")
    public ResponseEntity<List<BusinessResponse>> getMyBusinesses(@RequestParam Long ownerId) {
        try {
            log.info("가게 목록 조회 요청 - ownerId: {}", ownerId);
            List<BusinessResponse> businesses = businessService.getBusinessesByOwnerId(ownerId);
            log.info("가게 목록 조회 성공 - ownerId: {}, 가게 수: {}", ownerId, businesses.size());
            return ResponseEntity.ok(businesses);

        } catch (IllegalArgumentException e) {
            log.warn("잘못된 요청: {}", e.getMessage());
            throw e;

        } catch (Exception e) {
            log.error("가게 목록 조회 실패", e);
            throw new IllegalStateException("가게 목록 조회 중 오류가 발생했습니다.");
        }
    }

    /**
     * 새로운 가게 등록
     */
    @PostMapping("/api/business")
    public ResponseEntity<BusinessResponse> registerBusiness(@Valid @RequestBody BusinessRequestDto requestDto) {
        log.info("가게 등록 요청 - ownerId: {}, businessName: {}", requestDto.getOwnerId(), requestDto.getBusinessName());
        BusinessResponse response = businessService.registerBusiness(requestDto);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
