package com.epiis.DS26.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.DS26.business.LearningBusiness;
import com.epiis.DS26.dto.request.LessonProgressRequest;
import com.epiis.DS26.dto.response.CourseContentResponse;
import com.epiis.DS26.dto.response.CourseProgressResponse;
import com.epiis.DS26.message.ApiResponse;
import com.epiis.DS26.message.GenericResponse;

@RestController
@RequestMapping(path = "learning")
public class LearningController {

    private final LearningBusiness learningBusiness;

    public LearningController(LearningBusiness learningBusiness) {
        this.learningBusiness = learningBusiness;
    }

    @GetMapping(path = "course-content/{idCourse}", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<CourseContentResponse>> getCourseContent(@PathVariable String idCourse) {
        GenericResponse response = new GenericResponse();
        CourseContentResponse courseContent = learningBusiness.getCourseContent(idCourse, response);
        ApiResponse<CourseContentResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (courseContent != null) {
            apiResponse.setData(courseContent);
            return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @PostMapping(path = "progress", consumes = { MediaType.APPLICATION_JSON_VALUE }, produces = {
            MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<CourseProgressResponse>> saveProgress(
            @RequestBody LessonProgressRequest request) {
        GenericResponse response = new GenericResponse();
        CourseProgressResponse progress = learningBusiness.saveProgress(request, response);
        ApiResponse<CourseProgressResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (progress != null) {
            apiResponse.setData(progress);
            return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

}
