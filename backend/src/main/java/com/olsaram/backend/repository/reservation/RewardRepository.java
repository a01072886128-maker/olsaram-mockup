package com.olsaram.backend.repository.reservation;

import com.olsaram.backend.domain.reservation.Reward;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RewardRepository extends JpaRepository<Reward, Long> {
    List<Reward> findByMemberId(Long memberId);
}
