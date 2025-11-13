package com.olsaram.backend.dto.map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MapSearchResponse {
    private String name;
    private String address;
    private String phone;
    private String description;
    private String category;
    private Double lat;   // 🔹 String → Double
    private Double lng;   // 🔹 String → Double
}
