package com.epiis.ds26.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.epiis.ds26.business.EnrollmentBusiness;
import com.epiis.ds26.dto.request.EnrollmentRequest;
import com.epiis.ds26.dto.response.CertificateResponse;
import com.epiis.ds26.dto.response.MyCourseResponse;
import com.epiis.ds26.dto.response.EnrollmentResponse;
import com.epiis.ds26.entity.EntityEnrollment;
import com.epiis.ds26.message.ApiResponse;
import com.epiis.ds26.message.GenericResponse;

@ExtendWith(MockitoExtension.class)
class EnrollmentControllerTest {

    @Mock
    private EnrollmentBusiness business;

    @InjectMocks
    private EnrollmentController enrollmentController;

    private EnrollmentRequest request;
    private EntityEnrollment entity;
    private EnrollmentResponse responseDto;

    @BeforeEach
    void setUp() {
        request = new EnrollmentRequest();
        entity = new EntityEnrollment();
        responseDto = new EnrollmentResponse();
    }

    @Test
    void enrollInCourse_success() {
        when(business.enrollInCourse(eq(request), any(GenericResponse.class))).thenReturn(entity);
        when(business.mapToResponse(entity)).thenReturn(responseDto);

        ResponseEntity<ApiResponse<EnrollmentResponse>> response = enrollmentController.enrollInCourse(request);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertEquals(responseDto, response.getBody().getData());
    }

    @Test
    void enrollInCourse_failure() {
        when(business.enrollInCourse(eq(request), any(GenericResponse.class))).thenReturn(null);

        ResponseEntity<ApiResponse<EnrollmentResponse>> response = enrollmentController.enrollInCourse(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getAll_returnsList() {
        when(business.getAllEnrollments()).thenReturn(List.of(responseDto));

        ResponseEntity<List<EnrollmentResponse>> response = enrollmentController.getAll();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getById_exists_returnsResponse() {
        when(business.getEnrollmentById("enr-1")).thenReturn(responseDto);

        ResponseEntity<EnrollmentResponse> response = enrollmentController.getById("enr-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(responseDto, response.getBody());
    }

    @Test
    void getById_notExists_returnsNotFound() {
        when(business.getEnrollmentById("enr-1")).thenReturn(null);

        ResponseEntity<EnrollmentResponse> response = enrollmentController.getById("enr-1");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void delete_success() {
        when(business.deleteEnrollment(eq("enr-1"), any(GenericResponse.class))).thenReturn(true);

        ResponseEntity<ApiResponse<EnrollmentResponse>> response = enrollmentController.delete("enr-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void delete_failure() {
        when(business.deleteEnrollment(eq("enr-1"), any(GenericResponse.class))).thenReturn(false);

        ResponseEntity<ApiResponse<EnrollmentResponse>> response = enrollmentController.delete("enr-1");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getReport_returnsList() {
        when(business.getEnrollmentReport("stud-1")).thenReturn(List.of(responseDto));

        ResponseEntity<List<EnrollmentResponse>> response = enrollmentController.getReport("stud-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void checkEnrollment_returnsBoolean() {
        when(business.isEnrolled("cour-1")).thenReturn(true);

        ResponseEntity<Boolean> response = enrollmentController.checkEnrollment("cour-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody());
    }

    @Test
    void getMyCourses_returnsList() {
        MyCourseResponse myCourse = new MyCourseResponse();
        when(business.getMyCouses()).thenReturn(List.of(myCourse));

        ResponseEntity<List<MyCourseResponse>> response = enrollmentController.getMyCourses();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getCertificate_success() {
        CertificateResponse cert = new CertificateResponse();
        when(business.getCertificate(eq("cour-1"), any(GenericResponse.class))).thenReturn(cert);

        ResponseEntity<ApiResponse<CertificateResponse>> response = enrollmentController.getCertificate("cour-1");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(cert, response.getBody().getData());
    }

    @Test
    void getCertificate_failure() {
        when(business.getCertificate(eq("cour-1"), any(GenericResponse.class))).thenReturn(null);

        ResponseEntity<ApiResponse<CertificateResponse>> response = enrollmentController.getCertificate("cour-1");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
