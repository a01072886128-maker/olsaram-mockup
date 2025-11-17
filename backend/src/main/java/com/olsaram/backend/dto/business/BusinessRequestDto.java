package com.olsaram.backend.dto.business;

import com.fasterxml.jackson.annotation.JsonProperty;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessRequestDto {
    @JsonProperty("owner_id")
    @NotNull(message = "owner_id는 필수입니다.")
    private Long ownerId;

    @JsonProperty("business_name")
    @NotBlank(message = "가게 이름을 입력해주세요.")
    private String businessName;

    @JsonProperty("business_number")
    private String businessNumber;

    private String category;

    private String address;

    private String phone;

    private String description;

    @JsonProperty("business_image_url")
    private String businessImageUrl;

    @JsonProperty("opening_hours")
    private String openingHours;
}
