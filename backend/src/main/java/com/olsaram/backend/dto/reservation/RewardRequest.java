package com.olsaram.backend.dto.reservation;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class RewardRequest {
    private Long memberId;
    private Integer points;
    private String reason; // 적립 사유
}
