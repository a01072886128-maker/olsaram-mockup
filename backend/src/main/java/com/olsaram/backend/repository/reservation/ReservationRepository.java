package com.olsaram.backend.repository.reservation;

import com.olsaram.backend.domain.reservation.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByMemberId(Long memberId);
    List<Reservation> findByBusinessId(Long businessId);
    List<Reservation> findByBusinessIdIn(List<Long> businessIds);

    List<Reservation> findByBusinessIdAndReservationTimeBetween(
            Long businessId,
            LocalDateTime startTime,
            LocalDateTime endTime
    );
}
