package com.epiis.ds26.dto.response;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@AllArgsConstructor
public class LoginResponse {
    private static final String BEARER_TOKEN_TYPE = "Bearer";

    private String accessToken;
    private String refreshToken;
    private long expiresIn;
    private String tokenType;
    private UserInfo user;

    public LoginResponse() {
        this.tokenType = BEARER_TOKEN_TYPE;
    }

    public LoginResponse(String accessToken, String refreshToken, long expiresIn, UserInfo user) {
        this.tokenType = BEARER_TOKEN_TYPE;
        this.accessToken = accessToken;
        this.refreshToken = refreshToken;
        this.expiresIn = expiresIn;
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
