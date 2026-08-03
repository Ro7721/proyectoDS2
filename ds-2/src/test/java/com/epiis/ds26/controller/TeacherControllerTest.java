package com.epiis.ds26.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.epiis.ds26.business.TeacherStudentBusiness;
import com.epiis.ds26.dto.response.TeacherEnrollmentResponse;
import com.epiis.ds26.message.ApiResponse;
import com.epiis.ds26.message.GenericResponse;

@ExtendWith(MockitoExtension.class)
class TeacherControllerTest {

    @Mock
    private TeacherStudentBusiness teacherStudentBusiness;

    @InjectMocks
    private TeacherController teacherController;

    @Test
    void getTeacherEnrollments_success() {
        TeacherEnrollmentResponse tr = new TeacherEnrollmentResponse();
        when(teacherStudentBusiness.getTeacherEnrollments(any(GenericResponse.class))).thenReturn(List.of(tr));

        ResponseEntity<ApiResponse<List<TeacherEnrollmentResponse>>> response = teacherController.getTeacherEnrollments();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void getTeacherEnrollmentsByCourse_success() {
        TeacherEnrollmentResponse tr = new TeacherEnrollmentResponse();
        when(teacherStudentBusiness.getTeacherEnrollmentsByCourse(eq("cour-1"), any(GenericResponse.class))).thenReturn(List.of(tr));

        ResponseEntity<ApiResponse<List<TeacherEnrollmentResponse>>> response = teacherController.getTeacherEnrollmentsByCourse("cour-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }
}
