package com.olsaram.backend.controller.map;

import com.olsaram.backend.dto.map.MapSearchResponse;
import com.olsaram.backend.entity.Business;
import com.olsaram.backend.repository.business.MapBusinessRepository;

import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.List;

@RestController
@RequestMapping("/api/map")
@RequiredArgsConstructor
public class MapSearchController {

    private final MapBusinessRepository mapBusinessRepository;

    // ✅ 지도 반경 내 가게 검색
    @GetMapping("/search")
    public List<MapSearchResponse> searchBusinesses(
            @RequestParam BigDecimal minLat,
            @RequestParam BigDecimal maxLat,
            @RequestParam BigDecimal minLon,
            @RequestParam BigDecimal maxLon
    ) {
        List<Business> businesses =
                mapBusinessRepository.findActiveBusinessesByLocation(minLat, maxLat, minLon, maxLon);

        // Entity → DTO 변환
        return businesses.stream()
                .map(b -> MapSearchResponse.builder()
                        .name(b.getBusinessName())
                        .category(b.getCategory())
                        .address(b.getAddress())
                        .phone(b.getPhone())
                        .lat(b.getLatitude().doubleValue())
                        .lng(b.getLongitude().doubleValue())
                        .build())
                .toList();
    }
}
