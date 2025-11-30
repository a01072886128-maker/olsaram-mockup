package com.olsaram.backend.service.risk;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Map;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class ReservationRiskPrediction {

    @JsonProperty("risk_level")
    private String riskLevel;

    private Map<String, Double> proba;
}
