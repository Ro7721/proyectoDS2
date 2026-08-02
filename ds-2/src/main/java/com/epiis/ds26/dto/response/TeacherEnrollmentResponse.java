package com.epiis.ds26.dto.response;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class TeacherEnrollmentResponse {
    private String idEnrollment;
    private String idStudent;
    private String studentFullName;
    private String studentEmail;

    private String idCourse;
    private String courseTitle;
    private String courseImage;

    private Integer totalProgress;
    private Boolean completed;

    private LocalDateTime enrollmentDate;
    private LocalDateTime lastAccess;
}
