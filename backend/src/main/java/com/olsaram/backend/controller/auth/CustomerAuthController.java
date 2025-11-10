package com.olsaram.backend.controller.auth;

import com.olsaram.backend.domain.customer.Customer;
import com.olsaram.backend.dto.auth.AuthResponse;
import com.olsaram.backend.dto.auth.CustomerRegisterRequest;
import com.olsaram.backend.dto.auth.LoginRequest;
import com.olsaram.backend.service.auth.CustomerAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/customer/auth")
@RequiredArgsConstructor
public class CustomerAuthController {

    private final CustomerAuthService customerAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody CustomerRegisterRequest request) {
        try {
            Customer customer = customerAuthService.register(
                request.getLoginId(),
                request.getPassword(),
                request.getName(),
                request.getPhone(),
                request.getEmail()
            );

            AuthResponse response = AuthResponse.builder()
                .success(true)
                .message("회원가입이 완료되었습니다.")
                .data(customer)
                .build();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            AuthResponse response = AuthResponse.builder()
                .success(false)
                .message(e.getMessage())
                .build();

            return ResponseEntity.badRequest().body(response);
        }
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@RequestBody LoginRequest request) {
        try {
            Customer customer = customerAuthService.login(
                request.getLoginId(),
                request.getPassword()
            );

            AuthResponse response = AuthResponse.builder()
                .success(true)
                .message("로그인 성공")
                .data(customer)
                .build();

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            AuthResponse response = AuthResponse.builder()
                .success(false)
                .message(e.getMessage())
                .build();

            return ResponseEntity.badRequest().body(response);
        }
    }
}
