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

    // ✅ RESTful 버전 추천
    @GetMapping("/{name}")
    public ResponseEntity<BusinessDetailResponse> getBusinessDetail(@PathVariable String name) {
        BusinessDetailResponse response = businessDetailService.getBusinessDetail(name);
        return ResponseEntity.ok(response);
    }
}
