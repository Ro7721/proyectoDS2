package com.epiis.DS26.dto.response;

import lombok.Getter;
import lombok.Setter;

@Setter
@Getter
public class CourseCardResponse {
    private String idCourse;
    private String title;
    private String description;
    private String coverImage;
    private String level;
    private double price;
    private String status;
    private String teacherFullName;
    private String categoryName;
    private int totalLessons;
}
