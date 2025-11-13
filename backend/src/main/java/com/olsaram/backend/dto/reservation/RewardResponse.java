package com.olsaram.backend.dto.reservation;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class RewardResponse {
    private Long id;
    private Long memberId;
    private Integer points;
    private String reason;
}
