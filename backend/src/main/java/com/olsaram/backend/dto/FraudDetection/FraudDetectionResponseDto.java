package com.olsaram.backend.dto.FraudDetection;

import lombok.Builder;
import lombok.Data;

import java.util.List;

@Data
@Builder
public class FraudDetectionResponseDto {

    private String alertMessage;

    private int blockedThisMonth;
    private int savedAmount;
    private double detectionRate;
    private double falsePositive;

    private List<SuspiciousReservationDto> suspiciousReservations;

}
