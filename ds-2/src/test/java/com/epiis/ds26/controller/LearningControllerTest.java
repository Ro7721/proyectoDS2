package com.epiis.ds26.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.epiis.ds26.business.LearningBusiness;
import com.epiis.ds26.dto.request.LessonProgressRequest;
import com.epiis.ds26.dto.response.CourseContentResponse;
import com.epiis.ds26.dto.response.CourseProgressResponse;
import com.epiis.ds26.message.ApiResponse;
import com.epiis.ds26.message.GenericResponse;

@ExtendWith(MockitoExtension.class)
class LearningControllerTest {

    @Mock
    private LearningBusiness learningBusiness;

    @InjectMocks
    private LearningController learningController;

    private LessonProgressRequest progressRequest;
    private CourseContentResponse contentResponse;
    private CourseProgressResponse progressResponse;

    @BeforeEach
    void setUp() {
        progressRequest = new LessonProgressRequest();
        contentResponse = new CourseContentResponse();
        progressResponse = new CourseProgressResponse();
    }

    @Test
    void getCourseContent_success() {
        when(learningBusiness.getCourseContent(eq("cour-1"), any(GenericResponse.class))).thenReturn(contentResponse);

        ResponseEntity<ApiResponse<CourseContentResponse>> response = learningController.getCourseContent("cour-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(contentResponse, response.getBody().getData());
    }

    @Test
    void getCourseContent_failure() {
        when(learningBusiness.getCourseContent(eq("cour-1"), any(GenericResponse.class))).thenReturn(null);

        ResponseEntity<ApiResponse<CourseContentResponse>> response = learningController.getCourseContent("cour-1");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void saveProgress_success() {
        when(learningBusiness.saveProgress(eq(progressRequest), any(GenericResponse.class))).thenReturn(progressResponse);

        ResponseEntity<ApiResponse<CourseProgressResponse>> response = learningController.saveProgress(progressRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(progressResponse, response.getBody().getData());
    }

    @Test
    void saveProgress_failure() {
        when(learningBusiness.saveProgress(eq(progressRequest), any(GenericResponse.class))).thenReturn(null);

        ResponseEntity<ApiResponse<CourseProgressResponse>> response = learningController.saveProgress(progressRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
