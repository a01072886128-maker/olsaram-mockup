package com.olsaram.backend.dto;

public class MemberDto {
    private Long memberId;
    private String userId;
    private String name;
    private String phone;
    private String email;
    private String role;
    private Integer trustScore;
    private Integer noShowCount;
    private String status;

    public MemberDto() {
    }

    public MemberDto(Long memberId, String userId, String name, String phone, String email,
                     String role, Integer trustScore, Integer noShowCount, String status) {
        this.memberId = memberId;
        this.userId = userId;
        this.name = name;
        this.phone = phone;
        this.email = email;
        this.role = role;
        this.trustScore = trustScore;
        this.noShowCount = noShowCount;
        this.status = status;
    }

    public Long getMemberId() {
        return memberId;
    }

    public void setMemberId(Long memberId) {
        this.memberId = memberId;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getPhone() {
        return phone;
    }

    public void setPhone(String phone) {
        this.phone = phone;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getTrustScore() {
        return trustScore;
    }

    public void setTrustScore(Integer trustScore) {
        this.trustScore = trustScore;
    }

    public Integer getNoShowCount() {
        return noShowCount;
    }

    public void setNoShowCount(Integer noShowCount) {
        this.noShowCount = noShowCount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}
