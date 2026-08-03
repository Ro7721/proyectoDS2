package com.epiis.ds26.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.epiis.ds26.business.CourseBusiness;
import com.epiis.ds26.dto.request.CourseRequest;
import com.epiis.ds26.dto.response.CourseCardResponse;
import com.epiis.ds26.dto.response.CourseResponse;
import com.epiis.ds26.entity.EntityCourse;
import com.epiis.ds26.message.ApiResponse;
import com.epiis.ds26.message.GenericResponse;

@ExtendWith(MockitoExtension.class)
class CourseControllerTest {

    @Mock
    private CourseBusiness courseBusiness;

    @InjectMocks
    private CourseController courseController;

    private CourseRequest sampleRequest;
    private EntityCourse sampleCourse;
    private CourseResponse sampleResponse;
    private CourseCardResponse sampleCardResponse;

    @BeforeEach
    void setUp() {
        sampleRequest = new CourseRequest();
        sampleCourse = new EntityCourse();
        sampleResponse = new CourseResponse();
        sampleCardResponse = new CourseCardResponse();
    }

    @Test
    void create_success() {
        when(courseBusiness.createCourse(eq(sampleRequest), any(GenericResponse.class))).thenReturn(sampleCourse);
        when(courseBusiness.mapToResponse(sampleCourse)).thenReturn(sampleResponse);

        ResponseEntity<ApiResponse<CourseResponse>> response = courseController.createCourse(sampleRequest);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(sampleResponse, response.getBody().getData());
    }

    @Test
    void create_failure() {
        when(courseBusiness.createCourse(eq(sampleRequest), any(GenericResponse.class))).thenReturn(null);

        ResponseEntity<ApiResponse<CourseResponse>> response = courseController.createCourse(sampleRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getAllCourses_success() {
        when(courseBusiness.findAllCourse()).thenReturn(Collections.singletonList(sampleResponse));

        ResponseEntity<List<CourseResponse>> response = courseController.getAllCourses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getById_success() {
        when(courseBusiness.getById(eq("course-123"), any(GenericResponse.class))).thenReturn(sampleResponse);

        ResponseEntity<ApiResponse<CourseResponse>> response = courseController.getById("course-123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(sampleResponse, response.getBody().getData());
    }

    @Test
    void publish_success() {
        when(courseBusiness.publish(eq("course-123"), any(GenericResponse.class))).thenReturn(true);

        ResponseEntity<ApiResponse<CourseResponse>> response = courseController.publishCourse("course-123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void publish_failure() {
        when(courseBusiness.publish(eq("course-123"), any(GenericResponse.class))).thenReturn(false);

        ResponseEntity<ApiResponse<CourseResponse>> response = courseController.publishCourse("course-123");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void unpublish_success() {
        when(courseBusiness.unpublish(eq("course-123"), any(GenericResponse.class))).thenReturn(true);

        ResponseEntity<ApiResponse<CourseResponse>> response = courseController.unpublishCourse("course-123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void delete_success() {
        when(courseBusiness.deleteCourse(eq("course-123"), any(GenericResponse.class))).thenReturn(true);

        ResponseEntity<ApiResponse<CourseResponse>> response = courseController.deleteCourse("course-123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void update_success() {
        when(courseBusiness.updateCourse(eq("course-123"), eq(sampleRequest), any(GenericResponse.class)))
                .thenReturn(sampleCourse);
        when(courseBusiness.mapToResponse(sampleCourse)).thenReturn(sampleResponse);

        ResponseEntity<ApiResponse<CourseResponse>> response = courseController.updateCourse("course-123", sampleRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(sampleResponse, response.getBody().getData());
    }

    @Test
    void update_failure() {
        when(courseBusiness.updateCourse(eq("course-123"), eq(sampleRequest), any(GenericResponse.class)))
                .thenReturn(null);

        ResponseEntity<ApiResponse<CourseResponse>> response = courseController.updateCourse("course-123", sampleRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getByTeacher_success() {
        when(courseBusiness.findByTeacherCourse("teacher-123")).thenReturn(Collections.singletonList(sampleResponse));

        ResponseEntity<ApiResponse<List<CourseResponse>>> response = courseController.findByTeacher("teacher-123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void getCourseWithLessons_success() {
        when(courseBusiness.getCoursesWithLessonsAndFilesByTeacher(eq("teacher-123"), any(GenericResponse.class)))
                .thenReturn(Collections.singletonList(sampleResponse));

        ResponseEntity<ApiResponse<List<CourseResponse>>> response = courseController
                .findByTeacherWithLessons("teacher-123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void getCourseWithLessons_failure() {
        when(courseBusiness.getCoursesWithLessonsAndFilesByTeacher(eq("teacher-123"), any(GenericResponse.class)))
                .thenReturn(null);

        ResponseEntity<ApiResponse<List<CourseResponse>>> response = courseController
                .findByTeacherWithLessons("teacher-123");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getAllPublishedCards_success() {
        when(courseBusiness.findAllPublishedCourses()).thenReturn(Collections.singletonList(sampleCardResponse));

        ResponseEntity<ApiResponse<List<CourseCardResponse>>> response = courseController.getPublicCourses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void searchCourses_success() {
        when(courseBusiness.searchCourses(eq("search"), any(GenericResponse.class)))
                .thenReturn(Collections.singletonList(sampleResponse));

        ResponseEntity<ApiResponse<List<CourseResponse>>> response = courseController.searchCourses("search");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void searchCourses_failure() {
        when(courseBusiness.searchCourses(eq("search"), any(GenericResponse.class)))
                .thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<CourseResponse>>> response = courseController.searchCourses("search");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
