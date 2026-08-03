package com.epiis.ds26.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

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

import com.epiis.ds26.business.LessonBusiness;
import com.epiis.ds26.dto.request.LessonRequest;
import com.epiis.ds26.dto.response.LessonResponse;
import com.epiis.ds26.entity.EntityLesson;
import com.epiis.ds26.message.ApiResponse;
import com.epiis.ds26.message.GenericResponse;

@ExtendWith(MockitoExtension.class)
class LessonControllerTest {

    @Mock
    private LessonBusiness lessonBusiness;

    @InjectMocks
    private LessonController lessonController;

    private LessonRequest request;
    private EntityLesson lesson;
    private LessonResponse responseDto;

    @BeforeEach
    void setUp() {
        request = new LessonRequest();
        lesson = new EntityLesson();
        responseDto = new LessonResponse();
    }

    @Test
    void create_success() {
        when(lessonBusiness.insert(eq(request), any(), any(), any(GenericResponse.class))).thenReturn(lesson);
        when(lessonBusiness.mapToResponse(lesson)).thenReturn(responseDto);

        ResponseEntity<ApiResponse<LessonResponse>> response = lessonController.create(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(responseDto, response.getBody().getData());
    }

    @Test
    void create_failure() {
        when(lessonBusiness.insert(eq(request), any(), any(), any(GenericResponse.class))).thenReturn(null);

        ResponseEntity<ApiResponse<LessonResponse>> response = lessonController.create(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void update_success() {
        when(lessonBusiness.updateLesson(eq("les-1"), eq(request), any(), any(), any(GenericResponse.class))).thenReturn(lesson);
        when(lessonBusiness.mapToResponse(lesson)).thenReturn(responseDto);

        ResponseEntity<ApiResponse<LessonResponse>> response = lessonController.update("les-1", request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseDto, response.getBody().getData());
    }

    @Test
    void update_failure() {
        when(lessonBusiness.updateLesson(eq("les-1"), eq(request), any(), any(), any(GenericResponse.class))).thenReturn(null);

        ResponseEntity<ApiResponse<LessonResponse>> response = lessonController.update("les-1", request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getAllLessons_returnsList() {
        when(lessonBusiness.getLesson()).thenReturn(List.of(responseDto));

        ResponseEntity<List<LessonResponse>> response = lessonController.getAllLessons();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void delete_success() {
        when(lessonBusiness.deleteLesson(eq("les-1"), any(GenericResponse.class))).thenReturn(true);

        ResponseEntity<ApiResponse<LessonResponse>> response = lessonController.delete("les-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void delete_failure() {
        when(lessonBusiness.deleteLesson(eq("les-1"), any(GenericResponse.class))).thenReturn(false);

        ResponseEntity<ApiResponse<LessonResponse>> response = lessonController.delete("les-1");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getLessonsByTeacher_returnsList() {
        when(lessonBusiness.getLessonsByTeacher("teach-1")).thenReturn(List.of(responseDto));

        ResponseEntity<List<LessonResponse>> response = lessonController.getLessonsByTeacher("teach-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getLessonsByCourseAndTeacher_returnsList() {
        when(lessonBusiness.getLessonsByCourseAndTeacher("cour-1", "teach-1")).thenReturn(List.of(responseDto));

        ResponseEntity<List<LessonResponse>> response = lessonController.getLessonsByCourseAndTeacher("cour-1", "teach-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void searchLessons_success() {
        when(lessonBusiness.searchLessons(eq("Intro"), any(GenericResponse.class))).thenReturn(List.of(responseDto));

        ResponseEntity<ApiResponse<List<LessonResponse>>> response = lessonController.searchLessons("Intro");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void searchLessons_failure() {
        when(lessonBusiness.searchLessons(eq("Intro"), any(GenericResponse.class))).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<LessonResponse>>> response = lessonController.searchLessons("Intro");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
