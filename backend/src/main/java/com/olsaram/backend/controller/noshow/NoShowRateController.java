package com.olsaram.backend.controller.noshow;

import com.olsaram.backend.dto.noshow.NoShowRateResponse;
import com.olsaram.backend.service.noshow.NoShowRateService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 노쇼율 계산 API 컨트롤러
 * MVP 버전: 실제 DB 기반 노쇼율 제공
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class NoShowRateController {

    private final NoShowRateService noShowRateService;

    /**
     * 가게별 노쇼율 조회
     * GET /api/businesses/{businessId}/noshow-rate
     */
    @GetMapping("/businesses/{businessId}/noshow-rate")
    public NoShowRateResponse getNoShowRate(@PathVariable Long businessId) {
        return noShowRateService.calculateNoShowRate(businessId);
    }

    /**
     * 사장님의 모든 가게 노쇼율 조회
     * GET /api/owners/{ownerId}/noshow-rate
     */
    @GetMapping("/owners/{ownerId}/noshow-rate")
    public List<NoShowRateResponse> getNoShowRatesByOwner(@PathVariable Long ownerId) {
        return noShowRateService.calculateNoShowRatesByOwnerId(ownerId);
    }
}
