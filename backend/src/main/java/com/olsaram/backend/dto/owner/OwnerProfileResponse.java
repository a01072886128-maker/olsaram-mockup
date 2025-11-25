package com.olsaram.backend.dto.owner;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OwnerProfileResponse {
    private Long ownerId;
    private String loginId;
    private String name;
    private String phone;
    private String email;
    private String profileImageUrl;
    private String businessNumber;
    private Boolean isVerified;
    private String subscriptionPlan;
    private Integer maxBusinessCount;
    private Integer totalBusinessCount;
    private Long totalRevenue;
    private LocalDateTime createdAt;
}
