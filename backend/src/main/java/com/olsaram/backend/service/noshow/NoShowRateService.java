package com.olsaram.backend.service.noshow;

import com.olsaram.backend.domain.business.Business;
import com.olsaram.backend.domain.reservation.Reservation;
import com.olsaram.backend.domain.reservation.ReservationStatus;
import com.olsaram.backend.dto.noshow.NoShowRateResponse;
import com.olsaram.backend.repository.BusinessRepository;
import com.olsaram.backend.repository.reservation.ReservationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * 가게별 노쇼율 계산 서비스
 * MVP 버전: 실제 DB 데이터 기반으로 노쇼율 계산
 */
@Service
@RequiredArgsConstructor
public class NoShowRateService {

    private final ReservationRepository reservationRepository;
    private final BusinessRepository businessRepository;

    /**
     * 가게별 노쇼율 계산 (전체 기간)
     *
     * @param businessId 가게 ID
     * @return 노쇼율 응답 DTO
     */
    public NoShowRateResponse calculateNoShowRate(Long businessId) {

        // 가게 정보 조회
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new RuntimeException("Business not found (id=" + businessId + ")"));

        // 해당 가게의 모든 예약 조회
        List<Reservation> reservations = reservationRepository.findByBusinessId(businessId);

        // 전체 예약 수
        long totalReservations = reservations.size();

        // 노쇼 횟수 계산
        long noShowCount = reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.NO_SHOW)
                .count();

        // 완료된 예약 수
        long completedCount = reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.COMPLETED)
                .count();

        // 대기 중 예약 수
        long pendingCount = reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.PENDING
                          || r.getStatus() == ReservationStatus.CONFIRMED)
                .count();

        // 취소된 예약 수
        long canceledCount = reservations.stream()
                .filter(r -> r.getStatus() == ReservationStatus.CANCELED)
                .count();

        // 노쇼율 계산 (0으로 나누기 방지)
        double noShowRate = totalReservations > 0
                ? (double) noShowCount / totalReservations
                : 0.0;

        double noShowPercentage = noShowRate * 100;

        return NoShowRateResponse.builder()
                .businessId(businessId)
                .businessName(business.getBusinessName())
                .totalReservations(totalReservations)
                .noShowCount(noShowCount)
                .noShowRate(noShowRate)
                .noShowPercentage(noShowPercentage)
                .completedCount(completedCount)
                .pendingCount(pendingCount)
                .canceledCount(canceledCount)
                .build();
    }

    /**
     * 사장님 ID로 가게들의 노쇼율 조회
     * (한 사장님이 여러 가게를 소유한 경우를 대비)
     *
     * @param ownerId 사장님 ID
     * @return 노쇼율 응답 리스트
     */
    public List<NoShowRateResponse> calculateNoShowRatesByOwnerId(Long ownerId) {

        // 사장님의 모든 가게 조회
        List<Business> businesses = businessRepository.findByOwner_OwnerId(ownerId);

        // 각 가게별 노쇼율 계산
        return businesses.stream()
                .map(business -> calculateNoShowRate(business.getBusinessId()))
                .toList();
    }
}
