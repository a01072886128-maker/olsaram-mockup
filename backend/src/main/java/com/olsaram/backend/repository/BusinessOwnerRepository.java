package com.olsaram.backend.repository;

import com.olsaram.backend.domain.business.BusinessOwner;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BusinessOwnerRepository extends JpaRepository<BusinessOwner, Long> {
    Optional<BusinessOwner> findByLoginId(String loginId);
    Optional<BusinessOwner> findByBusinessNumber(String businessNumber);
    Optional<BusinessOwner> findByPhone(String phone);
    boolean existsByLoginId(String loginId);
    boolean existsByBusinessNumber(String businessNumber);
    boolean existsByPhone(String phone);
    boolean existsByEmail(String email);

    // 정보 수정 시 중복 체크 (자기 자신 제외)
    boolean existsByPhoneAndOwnerIdNot(String phone, Long ownerId);
    boolean existsByEmailAndOwnerIdNot(String email, Long ownerId);
    boolean existsByBusinessNumberAndOwnerIdNot(String businessNumber, Long ownerId);
}
