package com.olsaram.backend.controller.noshow;

import com.olsaram.backend.dto.noshow.ReservationRiskResponse;
import com.olsaram.backend.service.noshow.ReservationRiskService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * 예약별 위험도 계산 API 컨트롤러
 * MVP 버전: 룰 기반 위험도 계산
 */
@RestController
@RequestMapping("/api")
@RequiredArgsConstructor
public class ReservationRiskController {

    private final ReservationRiskService reservationRiskService;

    /**
     * 단일 예약의 위험도 조회
     * GET /api/reservations/{reservationId}/risk
     */
    @GetMapping("/reservations/{reservationId}/risk")
    public ReservationRiskResponse getReservationRisk(@PathVariable Long reservationId) {
        return reservationRiskService.calculateReservationRisk(reservationId);
    }

    /**
     * 여러 예약의 위험도 일괄 조회
     * POST /api/reservations/risk/batch
     */
    @PostMapping("/reservations/risk/batch")
    public List<ReservationRiskResponse> getBatchReservationRisk(@RequestBody List<Long> reservationIds) {
        return reservationRiskService.calculateBatchRisk(reservationIds);
    }
}
