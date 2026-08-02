package com.epiis.ds26.dto.response;

import java.time.LocalDateTime;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class MyCourseResponse {
    private String idEnrollment;
    private String idCourse;
    private String title;
    private String description;
    private String coverImage;
    private String teacherFullName;
    private String categoryName;
    private Integer totalLessons;
    private Integer totalProgress;
    private Boolean completed;
    private LocalDateTime lastAccess;
}
