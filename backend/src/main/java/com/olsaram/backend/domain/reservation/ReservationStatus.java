package com.olsaram.backend.domain.reservation;

public enum ReservationStatus {
    PENDING,        // 대기
    CONFIRMED,      // 확정
    CANCELED,       // 취소
    NO_SHOW,        // 노쇼 (고객이 예약 시간에 나타나지 않음)
    COMPLETED       // 완료 (정상 방문 완료)
}
