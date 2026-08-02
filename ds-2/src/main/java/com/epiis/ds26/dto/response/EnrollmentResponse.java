package com.epiis.ds26.dto.response;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class EnrollmentResponse {
    private String idEnrollment;
    private String studentId;
    private String courseId;
    private String studentName;
    private String courseTitle;
    private LocalDateTime enrollmentDate;
    private Integer totalProgress;
    private boolean isCompleted;
}
