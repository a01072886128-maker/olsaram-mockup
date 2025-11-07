package com.olsaram.backend.dto;

public class LoginResponse {
    private boolean success;
    private String message;
    private MemberDto data;

    public LoginResponse() {
    }

    public LoginResponse(boolean success, String message, MemberDto data) {
        this.success = success;
        this.message = message;
        this.data = data;
    }

    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public MemberDto getData() {
        return data;
    }

    public void setData(MemberDto data) {
        this.data = data;
    }
}
