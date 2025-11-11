package com.olsaram.backend.service.auth;

import com.olsaram.backend.domain.business.BusinessOwner;
import com.olsaram.backend.repository.BusinessOwnerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class BusinessOwnerAuthService {

    private final BusinessOwnerRepository businessOwnerRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 사장님 회원가입
     */
    @Transactional
    public BusinessOwner register(String loginId, String password, String name,
                                 String phone, String email, String businessNumber) {
        // 중복 체크
        if (businessOwnerRepository.existsByLoginId(loginId)) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        if (StringUtils.hasText(businessNumber) && businessOwnerRepository.existsByBusinessNumber(businessNumber)) {
            throw new IllegalArgumentException("이미 등록된 사업자등록번호입니다.");
        }

        BusinessOwner owner = BusinessOwner.builder()
            .loginId(loginId)
            .password(passwordEncoder.encode(password))
            .name(name)
            .phone(phone)
            .email(email)
            .businessNumber(businessNumber)
            .isVerified(false)
            .subscriptionPlan("FREE")
            .maxBusinessCount(1)
            .totalBusinessCount(0)
            .totalRevenue(0L)
            .build();

        return businessOwnerRepository.save(owner);
    }

    /**
     * 사장님 로그인
     */
    @Transactional
    public BusinessOwner login(String loginId, String password) {
        BusinessOwner owner = businessOwnerRepository.findByLoginId(loginId)
            .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 잘못되었습니다."));

        if (!passwordEncoder.matches(password, owner.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 잘못되었습니다.");
        }

        owner.setLastLoginAt(LocalDateTime.now());

        return owner;
    }
}
