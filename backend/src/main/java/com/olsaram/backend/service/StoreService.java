package com.olsaram.backend.service;

import com.olsaram.backend.domain.business.Business;
import com.olsaram.backend.domain.business.Menu;
import com.olsaram.backend.domain.business.Review;
import com.olsaram.backend.dto.store.NearbyStoreResponse;
import com.olsaram.backend.repository.MenuRepository;
import com.olsaram.backend.repository.business.MapBusinessRepository;
import com.olsaram.backend.repository.business.ReviewRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StoreService {

    private final MapBusinessRepository businessRepository;
    private final MenuRepository menuRepository;
    private final ReviewRepository reviewRepository;

    /**
     * 내 주변 맛집 검색
     */
    public List<NearbyStoreResponse> getNearbyStores(BigDecimal userLat, BigDecimal userLng, Integer radiusMeters) {

        double latDelta = (radiusMeters / 1000.0) / 111.0;
        double lngDelta = (radiusMeters / 1000.0) / (111.0 * Math.cos(Math.toRadians(userLat.doubleValue())));

        BigDecimal minLat = userLat.subtract(BigDecimal.valueOf(latDelta));
        BigDecimal maxLat = userLat.add(BigDecimal.valueOf(latDelta));
        BigDecimal minLng = userLng.subtract(BigDecimal.valueOf(lngDelta));
        BigDecimal maxLng = userLng.add(BigDecimal.valueOf(lngDelta));

        List<Business> businesses = businessRepository.findActiveBusinessesByLocation(
                minLat, maxLat, minLng, maxLng
        );

        return businesses.stream()
                .map(b -> convertToNearbyStoreResponse(b, userLat, userLng))
                .sorted((a, b) -> Double.compare(a.getDistance(), b.getDistance()))
                .collect(Collectors.toList());
    }

    /**
     * 가게 상세 정보 조회
     */
    public NearbyStoreResponse getStoreDetail(Long storeId) {
        Business business = businessRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("가게를 찾을 수 없습니다."));

        NearbyStoreResponse response = convertToNearbyStoreResponse(business, null, null);

        List<Menu> menus = menuRepository.findByBusinessIdOrderByCreatedAtDesc(storeId);
        response.setMenus(
                menus.stream()
                        .map(menu -> NearbyStoreResponse.MenuInfo.builder()
                                .id(menu.getMenuId())
                                .name(menu.getMenuName())
                                .price(menu.getPrice())
                                .build()
                        ).collect(Collectors.toList())
        );

        return response;
    }

    /**
     * 엔티티 → DTO 변환
     */
    private NearbyStoreResponse convertToNearbyStoreResponse(
            Business business, BigDecimal userLat, BigDecimal userLng) {

        Double distance = null;
        if (userLat != null && userLng != null) {
            distance = calculateDistance(
                    userLat.doubleValue(), userLng.doubleValue(),
                    business.getLatitude().doubleValue(),
                    business.getLongitude().doubleValue()
            );
        }

        // 대표메뉴 2개
        List<Menu> menus = menuRepository.findByBusinessIdOrderByCreatedAtDesc(business.getBusinessId());
        List<String> representativeMenus = menus.stream()
                .limit(2)
                .map(Menu::getMenuName)
                .collect(Collectors.toList());

        Double rating = business.getAverageRating() != null
                ? business.getAverageRating().doubleValue()
                : 4.5;

        String businessHours = business.getOpeningHours() != null
                ? business.getOpeningHours()
                : "11:00-22:00";

        String imageUrl = business.getBusinessImageUrl();

        return NearbyStoreResponse.builder()
                .id(business.getBusinessId())
                .name(business.getBusinessName())
                .distance(distance)
                .rating(rating)
                .address(business.getAddress())
                .imageUrl(imageUrl)
                .representativeMenus(representativeMenus)
                .businessHours(businessHours)
                .category(business.getCategory())
                .phone(business.getPhone())
                .description(business.getDescription())
                .latitude(business.getLatitude())
                .longitude(business.getLongitude())
                .menus(new ArrayList<>()) // 상세조회때만 채워짐
                .build();
    }

    /**
     * 거리 계산
     */
    private double calculateDistance(double lat1, double lng1, double lat2, double lng2) {
        final int EARTH_RADIUS = 6371;

        double latDist = Math.toRadians(lat2 - lat1);
        double lngDist = Math.toRadians(lng2 - lng1);

        double a = Math.sin(latDist / 2) * Math.sin(latDist / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                * Math.sin(lngDist / 2) * Math.sin(lngDist / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS * c;
    }

    /**
     * 단일 메뉴 조회
     */
    public List<Menu> getStoreMenus(Long storeId) {
        Business business = businessRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("가게를 찾을 수 없습니다."));
        return menuRepository.findByBusinessIdOrderByCreatedAtDesc(business.getBusinessId());
    }

    /**
     * 리뷰 조회
     */
    public List<Review> getStoreReviews(Long storeId) {
        Business business = businessRepository.findById(storeId)
                .orElseThrow(() -> new IllegalArgumentException("가게를 찾을 수 없습니다."));
        return reviewRepository.findByBusinessIdOrderByCreatedAtDesc(business.getBusinessId());
    }
}
