package com.olsaram.backend.controller.business;

import com.olsaram.backend.dto.map.BusinessDetailResponse;
import com.olsaram.backend.service.business.BusinessDetailService;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/business")
@RequiredArgsConstructor
public class BusinessDetailController {

    private final BusinessDetailService businessDetailService;

    /**
     * 🔥 가게 이름 기반 상세 조회
     * ID 조회(GET /api/business/{id})와 충돌 방지하기 위해 name prefix 추가
     */
    @GetMapping("/name/{name}")
    public ResponseEntity<BusinessDetailResponse> getBusinessDetail(@PathVariable String name) {
        BusinessDetailResponse response = businessDetailService.getBusinessDetail(name);
        return ResponseEntity.ok(response);
    }
}
