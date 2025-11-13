package com.olsaram.backend.repository.noshow;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.olsaram.backend.entity.noshow.ReservationData;

@Repository
public interface ReservationDataRepository extends JpaRepository<ReservationData, String> {
}
