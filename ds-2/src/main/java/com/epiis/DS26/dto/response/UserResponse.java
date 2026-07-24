package com.epiis.DS26.dto.response;

import com.epiis.DS26.enums.ERole;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class UserResponse {
    private String idUser;
    private String firstName;
    private String surName;
    private String email;
    private ERole role;
    private boolean isActive;
}
