package com.epiis.ds26.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class CourseResponse {
    private String idCourse;
    private String title;
    private String description;
    private String coverImage;
    private String level;
    private double price;
    private String status;
    private String categoryName;
    private LocalDateTime createdAt;
    private int totalLessons;
    private String teacherFullName;
    private List<LessonResponse> lessons;
}
