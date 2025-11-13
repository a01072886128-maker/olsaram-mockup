package com.olsaram.backend.service.reservation;

import com.olsaram.backend.domain.reservation.Reward;
import com.olsaram.backend.repository.reservation.RewardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class RewardService {

    private final RewardRepository rewardRepository;

    public Reward addReward(Reward reward) {
        return rewardRepository.save(reward);
    }

    public List<Reward> getAllRewards() {
        return rewardRepository.findAll();
    }

    public Optional<Reward> getRewardById(Long id) {
        return rewardRepository.findById(id);
    }

    public List<Reward> getRewardsByMemberId(Long memberId) {
        return rewardRepository.findByMemberId(memberId);
    }

    public void deleteReward(Long id) {
        rewardRepository.deleteById(id);
    }
}
