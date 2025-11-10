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
        // 중복 체크
        if (customerRepository.existsByLoginId(loginId)) {
            throw new IllegalArgumentException("이미 존재하는 아이디입니다.");
        }
        if (customerRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("이미 등록된 전화번호입니다.");
        }

        Customer customer = Customer.builder()
            .loginId(loginId)
            .password(passwordEncoder.encode(password))
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
     * 고객 로그인
     */
    @Transactional
    public Customer login(String loginId, String password) {
        Customer customer = customerRepository.findByLoginId(loginId)
            .orElseThrow(() -> new IllegalArgumentException("아이디 또는 비밀번호가 잘못되었습니다."));

        if (!passwordEncoder.matches(password, customer.getPassword())) {
            throw new IllegalArgumentException("아이디 또는 비밀번호가 잘못되었습니다.");
        }

        if (customer.getIsBlocked() != null && customer.getIsBlocked()) {
            throw new IllegalArgumentException("차단된 계정입니다.");
        }

        customer.setLastLoginAt(LocalDateTime.now());

        return customer;
    }
}
