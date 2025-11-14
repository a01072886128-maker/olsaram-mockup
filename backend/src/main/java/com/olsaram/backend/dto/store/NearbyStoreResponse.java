package com.olsaram.backend.dto.store;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NearbyStoreResponse {
    private Long id;
    private String name;
    private Double distance; // km 단위
    private Double rating;
    private String address;
    private String imageUrl;
    private List<String> representativeMenus;
    private String businessHours;
    private String category;
    private String phone;
    private String description;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private List<MenuInfo> menus;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class MenuInfo {
        private Long id;
        private String name;
        private BigDecimal price;
    }
}
