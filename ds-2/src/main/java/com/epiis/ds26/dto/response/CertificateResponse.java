package com.epiis.ds26.dto.response;

import java.time.LocalDateTime;

import lombok.Data;

@Data
public class CertificateResponse {
    private String certificateId;
    private String studentName;
    private String courseName;
    private String teacherName;
    private Integer totalLessons;
    private LocalDateTime completionDate;
}
