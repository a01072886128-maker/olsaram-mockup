package com.olsaram.backend.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AiNoshowResponse {

    @JsonProperty("노쇼확률")
    private Double noshowProbability;

    @JsonProperty("정책추천")
    private AiPolicyRecommendation policyRecommendation;

    @JsonProperty("이상패턴탐지")
    private AiSuspiciousResult suspiciousResult;
}
