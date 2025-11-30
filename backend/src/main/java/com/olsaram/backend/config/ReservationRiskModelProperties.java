package com.olsaram.backend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "risk-model")
public class ReservationRiskModelProperties {

    /**
     * Enable/disable the external Python-based risk model.
     */
    private boolean enabled = false;

    /**
     * Python executable to invoke (e.g. python3).
     */
    private String pythonCommand = "python3";

    /**
     * Path to backend/scripts/predict_reservation_risk.py.
     */
    private String scriptPath = "backend/scripts/predict_reservation_risk.py";

    /**
     * Path to backend/models/reservation_risk_model.pkl.
     */
    private String modelPath = "backend/models/reservation_risk_model.pkl";
}
