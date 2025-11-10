package com.olsaram.backend.controller.auth;

import com.olsaram.backend.domain.business.BusinessOwner;
import com.olsaram.backend.dto.auth.AuthResponse;
import com.olsaram.backend.dto.auth.BusinessOwnerRegisterRequest;
import com.olsaram.backend.dto.auth.LoginRequest;
import com.olsaram.backend.service.auth.BusinessOwnerAuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/business-owner/auth")
@RequiredArgsConstructor
public class BusinessOwnerAuthController {

    private final BusinessOwnerAuthService businessOwnerAuthService;

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@RequestBody BusinessOwnerRegisterRequest request) {
        try {
            BusinessOwner owner = businessOwnerAuthService.register(
                request.getLoginId(),
                request.getPassword(),
                request.getName(),
                request.getPhone(),
                request.getEmail(),
                request.getBusinessNumber()
            );

            AuthResponse response = AuthResponse.builder()
                .success(true)
                .message("회원가입이 완료되었습니다.")
                .data(owner)
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
            BusinessOwner owner = businessOwnerAuthService.login(
                request.getLoginId(),
                request.getPassword()
            );

            AuthResponse response = AuthResponse.builder()
                .success(true)
                .message("로그인 성공")
                .data(owner)
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
