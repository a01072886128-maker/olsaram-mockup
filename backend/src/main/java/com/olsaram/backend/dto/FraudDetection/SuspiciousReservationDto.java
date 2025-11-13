package com.olsaram.backend.dto.FraudDetection;

import lombok.Builder;
import lombok.Data;

import java.util.List;   // ⭐ 반드시 필요!

@Data
@Builder
public class SuspiciousReservationDto {

    private String id;               // PK (String)
    private String customerName;     // 고객 이름
    private String phoneNumber;      // 전화번호
    private int riskScore;           // 점수
    private String riskLevel;        // high / medium / low
    private List<String> reasons;    // 사유 목록
    private int partySize;           // 인원
    private String requestedDate;    // 예약 일시
    private String status;           // blocked / warning
}
