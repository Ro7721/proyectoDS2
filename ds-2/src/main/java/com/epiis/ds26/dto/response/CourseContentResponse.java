package com.epiis.ds26.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseContentResponse {
    private String idCourse;
    private String title;
    private String description;
    private String coverImage;
    private String teacherFullName;
    private String categoryName;
    private Integer totalLessons;
    private Integer totalProgress;
    private boolean completed;
    private LocalDateTime lastAccess;
    private List<LessonContentResponse> lessons;
}
