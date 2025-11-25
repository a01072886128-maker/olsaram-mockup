package com.olsaram.backend.dto.noshow;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * 가게별 노쇼율 응답 DTO
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class NoShowRateResponse {

    private Long businessId;              // 가게 ID
    private String businessName;          // 가게 이름
    private Long totalReservations;       // 전체 예약 수
    private Long noShowCount;             // 노쇼 횟수
    private Double noShowRate;            // 노쇼율 (0.0 ~ 1.0)
    private Double noShowPercentage;      // 노쇼율 퍼센트 (0 ~ 100)

    // 추가 통계 정보
    private Long completedCount;          // 정상 완료 예약 수
    private Long pendingCount;            // 대기 중 예약 수
    private Long canceledCount;           // 취소된 예약 수
}
