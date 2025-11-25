package com.olsaram.backend.controller;

import com.olsaram.backend.dto.store.NearbyStoreResponse;
import com.olsaram.backend.service.KakaoLocalService;
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
    private final KakaoLocalService kakaoLocalService;

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
    /**
     * 가게 메뉴 조회
     * GET /api/stores/{storeId}/menus
     */
    @GetMapping("/{storeId}/menus")
    public ResponseEntity<?> getStoreMenus(@PathVariable Long storeId) {
        try {
            return ResponseEntity.ok(storeService.getStoreMenus(storeId));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "메뉴 조회 중 오류: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 가게 리뷰 조회
     * GET /api/stores/{storeId}/reviews
     */
    @GetMapping("/{storeId}/reviews")
    public ResponseEntity<?> getStoreReviews(@PathVariable Long storeId) {
        try {
            return ResponseEntity.ok(storeService.getStoreReviews(storeId));
        } catch (IllegalArgumentException e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", e.getMessage());
            return ResponseEntity.status(404).body(error);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "리뷰 조회 중 오류: " + e.getMessage());
            return ResponseEntity.status(500).body(error);
        }
    }

    /**
     * 카카오 API로 주변 음식점 검색 후 DB 저장
     * POST /api/stores/fetch-kakao?lat={lat}&lng={lng}&radius={radius}
     */
    @PostMapping("/fetch-kakao")
    public ResponseEntity<Map<String, Object>> fetchKakaoRestaurants(
            @RequestParam double lat,
            @RequestParam double lng,
            @RequestParam(defaultValue = "3000") int radius) {

        Map<String, Object> response = new HashMap<>();
        try {
            int savedCount = kakaoLocalService.fetchAndSaveNearbyRestaurants(lat, lng, radius);
            response.put("success", true);
            response.put("savedCount", savedCount);
            response.put("message", savedCount + "개의 음식점이 저장되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "카카오 API 호출 실패: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * 중복 가게 데이터 삭제
     * DELETE /api/stores/duplicates
     */
    @DeleteMapping("/duplicates")
    public ResponseEntity<Map<String, Object>> removeDuplicates() {
        Map<String, Object> response = new HashMap<>();
        try {
            int deletedCount = kakaoLocalService.removeDuplicateBusinesses();
            response.put("success", true);
            response.put("deletedCount", deletedCount);
            response.put("message", deletedCount + "개의 중복 가게가 삭제되었습니다.");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "중복 삭제 실패: " + e.getMessage());
            return ResponseEntity.status(500).body(response);
        }
    }

    /**
     * DB 현황 조회
     * GET /api/stores/db-status
     */
    @GetMapping("/db-status")
    public ResponseEntity<Map<String, Object>> getDbStatus() {
        return ResponseEntity.ok(kakaoLocalService.getDbStatus());
    }

    /**
     * 광주 동구 가게에 사장님 계정 생성 및 연결
     * POST /api/stores/assign-owners
     */
    @PostMapping("/assign-owners")
    public ResponseEntity<Map<String, Object>> assignOwners() {
        return ResponseEntity.ok(kakaoLocalService.assignOwnersToBusinesses());
    }
}
