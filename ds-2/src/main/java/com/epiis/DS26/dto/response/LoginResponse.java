package com.epiis.DS26.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {
    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private String tokenType;
    private UserInfo user;

    public LoginResponse() {
        this.tokenType = "Bearer";
    }

    public LoginResponse(String accessToken, String refreshToken, long expiresIn, UserInfo user) {
        this.tokenType = "Bearer";
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
        this.tokenType = "Bearer";
        this.user = user;
    }

    @Getter
    @Setter
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserInfo {
        private String idUser;
        private String firstName;
        private String surName;
        private String email;
        private String role;
    }

}
