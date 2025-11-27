package com.olsaram.backend.dto.business;

import com.olsaram.backend.domain.business.Business;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessResponse {
    private Long businessId;
    private String businessName;
    private String businessNumber;
    private String category;
    private String address;
    private String phone;
    private String description;
    private String businessImageUrl;
    private Boolean isOpen;
    private Boolean isActive;
    private BigDecimal averageRating;
    private Integer reviewCount;
    private BigDecimal latitude;
    private BigDecimal longitude;
    private BigDecimal reservationFeeAmount;

    public static BusinessResponse from(Business business) {
        return BusinessResponse.builder()
                .businessId(business.getBusinessId())
                .businessName(business.getBusinessName())
                .businessNumber(business.getBusinessNumber())
                .category(business.getCategory())
                .address(business.getAddress())
                .phone(business.getPhone())
                .description(business.getDescription())
                .businessImageUrl(business.getBusinessImageUrl())
                .isOpen(business.getIsOpen())
                .isActive(business.getIsActive())
                .averageRating(business.getAverageRating())
                .reviewCount(business.getReviewCount())
                .latitude(business.getLatitude())
                .longitude(business.getLongitude())
                .reservationFeeAmount(business.getReservationFeeAmount())
                .build();
    }
}
