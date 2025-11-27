package com.olsaram.backend.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AiPolicyRecommendation {

    @JsonProperty("추천_정책")
    private String recommendedPolicy;

    @JsonProperty("근거")
    private String reason;
}
