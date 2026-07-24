package com.epiis.DS26.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.DS26.business.EnrollmentBusiness;
import com.epiis.DS26.dto.request.EnrollmentRequest;
import com.epiis.DS26.dto.response.CertificateResponse;
import com.epiis.DS26.dto.response.EnrollmentResponse;
import com.epiis.DS26.dto.response.MyCourseResponse;
import com.epiis.DS26.entity.EntityEnrollment;
import com.epiis.DS26.message.ApiResponse;
import com.epiis.DS26.message.GenericResponse;

import org.springframework.web.bind.annotation.RequestBody;

@RestController
@RequestMapping(path = "enrollments")
public class EnrollmentController {
    private final EnrollmentBusiness business;

    public EnrollmentController(EnrollmentBusiness business) {
        this.business = business;
    }

    @PostMapping(path = "enroll", consumes = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<EnrollmentResponse>> enrollInCourse(@RequestBody EnrollmentRequest request) {
        GenericResponse response = new GenericResponse();
        EntityEnrollment entity = business.enrollInCourse(request, response);
        ApiResponse<EnrollmentResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (entity != null) {
            apiResponse.setData(business.mapToResponse(entity));
            return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @GetMapping(path = "getall", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<List<EnrollmentResponse>> getAll() {
        List<EnrollmentResponse> list = business.getAllEnrollments();
        return ResponseEntity.ok(list);
    }

    @GetMapping(path = "getbyid/{idEnrollment}", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<EnrollmentResponse> getById(@PathVariable String idEnrollment) {
        EnrollmentResponse response = business.getEnrollmentById(idEnrollment);
        if (response != null) {
            return ResponseEntity.ok(response);
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping(path = "delete/{idEnrollment}", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<EnrollmentResponse>> delete(@PathVariable String idEnrollment) {
        GenericResponse response = new GenericResponse();
        boolean result = business.deleteEnrollment(idEnrollment, response);
        ApiResponse<EnrollmentResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (result) {
            return ResponseEntity.ok(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @GetMapping(path = "report", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<List<EnrollmentResponse>> getReport(@RequestParam String studentId) {
        List<EnrollmentResponse> list = business.getEnrollmentReport(studentId);
        return ResponseEntity.ok(list);
    }

    @GetMapping("/check/{courseId}")
    public ResponseEntity<Boolean> checkEnrollment(@PathVariable String courseId) {
        return ResponseEntity.ok(business.isEnrolled(courseId));
    }

    @GetMapping(path = "my-courses", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<List<MyCourseResponse>> getMyCourses() {
        List<MyCourseResponse> list = business.getMyCouses();
        return ResponseEntity.ok(list);
    }

    @GetMapping(path = "certificate/{idCourse}", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<CertificateResponse>> getCertificate(@PathVariable String idCourse) {
        GenericResponse response = new GenericResponse();
        CertificateResponse cert = business.getCertificate(idCourse, response);
        ApiResponse<CertificateResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (cert != null) {
            apiResponse.setData(cert);
            return ResponseEntity.ok(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }
}
