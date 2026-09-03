package com.epiis.ds26.dto.response;

import java.time.LocalDateTime;

import com.epiis.ds26.enums.ERole;

import lombok.Data;

@Data
public class ParticipantSummaryResponse {
    private String idUser;
    private String firstName;
    private String surName;
    private String email;
    private ERole role;
    private LocalDateTime lastReadAt;
}
