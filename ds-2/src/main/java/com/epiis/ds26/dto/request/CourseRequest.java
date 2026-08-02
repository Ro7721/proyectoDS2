package com.epiis.ds26.dto.request;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseRequest {
    private String title;
    private String description;
    private MultipartFile coverImage;
    private String level;
    private double price;
    private String status;
    private String idTeacher;
    private String idCategory;
}
