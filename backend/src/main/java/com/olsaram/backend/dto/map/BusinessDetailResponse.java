package com.olsaram.backend.dto.map;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BusinessDetailResponse {
    private String name;
    private String description;
    private String phone;
    private String address;
    private String openingHours;
    private double lat;
    private double lng;
}
