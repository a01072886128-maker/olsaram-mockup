package com.olsaram.backend.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BusinessOwnerRegisterRequest {
    private String loginId;
    private String password;
    private String name;
    private String phone;
    private String email;
    private String businessNumber;
}
