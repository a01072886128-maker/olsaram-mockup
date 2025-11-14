package com.olsaram.backend.controller;

import com.olsaram.backend.dto.store.NearbyStoreResponse;
import com.olsaram.backend.service.StoreService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/stores")
@RequiredArgsConstructor
public class StoreController {

    private final StoreService storeService;

    /**
     * 내 주변 맛집 검색
     * GET /api/stores/nearby?lat={lat}&lng={lng}&radius={radius}
     */
    @GetMapping("/nearby")
    public ResponseEntity<Map<String, Object>> getNearbyStores(
            @RequestParam BigDecimal lat,
            @RequestParam BigDecimal lng,
            @RequestParam(defaultValue = "5000") Integer radius) {

        try {
            List<NearbyStoreResponse> stores = storeService.getNearbyStores(lat, lng, radius);

            Map<String, Object> response = new HashMap<>();
            response.put("stores", stores);
            response.put("count", stores.size());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("message", "맛집 검색 중 오류가 발생했습니다: " + e.getMessage());
            error.put("stores", List.of());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 가게 상세 정보 조회
     * GET /api/stores/{storeId}
     */
    @GetMapping("/{storeId}")
    public ResponseEntity<?> getStoreDetail(@PathVariable Long storeId) {
        try {
            NearbyStoreResponse store = storeService.getStoreDetail(storeId);
            return ResponseEntity.ok(store);
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "가게 정보 조회 중 오류가 발생했습니다: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }
}
