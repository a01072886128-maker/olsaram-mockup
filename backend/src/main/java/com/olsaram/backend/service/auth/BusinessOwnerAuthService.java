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
        // 필수 입력값 검증
        validateRequiredFields(loginId, password, name, phone, email, businessNumber);

        // 비밀번호 유효성 검증
        validatePassword(password);

        // 이메일 형식 검증
        validateEmail(email);

        // 전화번호 형식 검증
        validatePhone(phone);

        // 사업자등록번호 형식 검증
        validateBusinessNumber(businessNumber);

        // 중복 체크
        if (businessOwnerRepository.existsByLoginId(loginId)) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        if (businessOwnerRepository.existsByBusinessNumber(businessNumber)) {
            throw new IllegalArgumentException("이미 등록된 사업자등록번호입니다.");
        }
        if (businessOwnerRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 등록된 이메일입니다.");
        }
        if (businessOwnerRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("이미 등록된 전화번호입니다.");
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
     * 필수 입력값 검증 (사업자)
     */
    private void validateRequiredFields(String loginId, String password, String name,
                                       String phone, String email, String businessNumber) {
        if (!StringUtils.hasText(loginId)) {
            throw new IllegalArgumentException("아이디를 입력해주세요.");
        }
        if (!StringUtils.hasText(password)) {
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");
        }
        if (!StringUtils.hasText(name)) {
            throw new IllegalArgumentException("이름을 입력해주세요.");
        }
        if (!StringUtils.hasText(phone)) {
            throw new IllegalArgumentException("전화번호를 입력해주세요.");
        }
        if (!StringUtils.hasText(email)) {
            throw new IllegalArgumentException("이메일을 입력해주세요.");
        }
        if (!StringUtils.hasText(businessNumber)) {
            throw new IllegalArgumentException("사업자등록번호를 입력해주세요.");
        }
    }

   /**
     * 비밀번호 유효성 검증
     * - 최소 4자 이상
     
     */
    private void validatePassword(String password) {
    if (password == null || !password.matches("\\d{4}")) {
        throw new IllegalArgumentException("비밀번호는 숫자 4자리여야 합니다.");
    }
}
    /**
     * 이메일 형식 검증
     */
    private void validateEmail(String email) {
        String emailRegex = "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$";
        if (!email.matches(emailRegex)) {
            throw new IllegalArgumentException("올바른 이메일 형식이 아닙니다.");
        }
    }

    /**
     * 전화번호 형식 검증
     * - 010-1234-5678, 01012345678, 02-1234-5678 등 허용
     */
    private void validatePhone(String phone) {
        String phoneRegex = "^(01[0-9]|02|0[3-9][0-9])-?[0-9]{3,4}-?[0-9]{4}$";
        if (!phone.matches(phoneRegex)) {
            throw new IllegalArgumentException("올바른 전화번호 형식이 아닙니다. (예: 010-1234-5678)");
        }
    }

    /**
     * 사업자등록번호 형식 검증
     * - 10자리 숫자 (하이픈 포함 가능: 123-45-67890)
     */
    private void validateBusinessNumber(String businessNumber) {
        String cleanNumber = businessNumber.replaceAll("-", "");
        if (!cleanNumber.matches("^\\d{10}$")) {
            throw new IllegalArgumentException("사업자등록번호는 10자리 숫자여야 합니다. (예: 123-45-67890)");
        }
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
