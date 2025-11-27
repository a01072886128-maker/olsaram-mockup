package com.olsaram.backend.dto.ai;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor @Builder
public class AiSuspiciousResult {

    @JsonProperty("의심패턴")
    private String suspiciousPattern;

    @JsonProperty("탐지근거")
    private String detectionReason;
}
