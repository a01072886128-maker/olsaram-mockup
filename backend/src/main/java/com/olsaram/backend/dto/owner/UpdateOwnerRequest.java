package com.olsaram.backend.dto.owner;

import lombok.Data;

@Data
public class UpdateOwnerRequest {
    private String name;
    private String phone;
    private String email;
    private String profileImageUrl;
    private String businessNumber;
}
