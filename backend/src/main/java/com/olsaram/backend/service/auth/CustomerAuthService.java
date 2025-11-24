package com.olsaram.backend.service.auth;

import com.olsaram.backend.domain.customer.Customer;
import com.olsaram.backend.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class CustomerAuthService {

    private final CustomerRepository customerRepository;
    private final PasswordEncoder passwordEncoder;

    /**
     * 고객 회원가입
     */
    @Transactional
    public Customer register(String loginId, String password, String name,
                           String phone, String email) {
        // 필수 입력값 검증
        validateRequiredFields(loginId, password, name, phone, email);

        // 비밀번호 유효성 검증
        validatePassword(password);

        // 이메일 형식 검증
        validateEmail(email);

        // 전화번호 형식 검증
        validatePhone(phone);

        // 중복 체크
        if (customerRepository.existsByLoginId(loginId)) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        if (customerRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("이미 등록된 전화번호입니다.");
        }
        if (customerRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("이미 등록된 이메일입니다.");
        }

        Customer customer = Customer.builder()
            .loginId(loginId)
            .password(password)  // 평문 저장 (DB에서 직접 확인 가능)
            .name(name)
            .phone(phone)
            .email(email)
            .trustScore(100)
            .noShowCount(0)
            .reservationCount(0)
            .rewardPoints(0)
            .customerGrade("BRONZE")
            .isBlocked(false)
            .build();

        return customerRepository.save(customer);
    }

    /**
     * 필수 입력값 검증 (고객)
     */
    private void validateRequiredFields(String loginId, String password, String name,
                                       String phone, String email) {
        if (loginId == null || loginId.trim().isEmpty()) {
            throw new IllegalArgumentException("아이디를 입력해주세요.");
        }
        if (password == null || password.trim().isEmpty()) {
            throw new IllegalArgumentException("비밀번호를 입력해주세요.");
        }
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("이름을 입력해주세요.");
        }
        if (phone == null || phone.trim().isEmpty()) {
            throw new IllegalArgumentException("전화번호를 입력해주세요.");
        }
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("이메일을 입력해주세요.");
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
     * 고객 로그인
     * - BCrypt 암호화된 비밀번호 또는 평문 비밀번호 둘 다 허용
     */
    @Transactional
    public Customer login(String loginId, String password) {
        Customer customer = customerRepository.findByLoginId(loginId)
            .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 잘못되었습니다."));

        // 평문 비밀번호 먼저 체크
        boolean passwordMatch = customer.getPassword().equals(password);

        // 평문이 아니면 BCrypt 체크 시도
        if (!passwordMatch) {
            try {
                passwordMatch = passwordEncoder.matches(password, customer.getPassword());
            } catch (Exception e) {
                // BCrypt 형식이 아닌 경우 무시
            }
        }

        if (!passwordMatch) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 잘못되었습니다.");
        }

        if (customer.getIsBlocked() != null && customer.getIsBlocked()) {
            throw new IllegalArgumentException("차단된 계정입니다.");
        }

        customer.setLastLoginAt(LocalDateTime.now());

        return customer;
    }
}
