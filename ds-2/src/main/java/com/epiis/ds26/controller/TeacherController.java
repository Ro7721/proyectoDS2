package com.epiis.ds26.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.ds26.business.TeacherStudentBusiness;
import com.epiis.ds26.dto.response.TeacherEnrollmentResponse;
import com.epiis.ds26.message.ApiResponse;
import com.epiis.ds26.message.GenericResponse;

@RestController
@RequestMapping(path = "teacher")
public class TeacherController {
    private final TeacherStudentBusiness teacherStudentBusiness;

    public TeacherController(TeacherStudentBusiness teacherStudentBusiness) {
        this.teacherStudentBusiness = teacherStudentBusiness;
    }

    @GetMapping(path = "enrollments", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<List<TeacherEnrollmentResponse>>> getTeacherEnrollments() {

        GenericResponse response = new GenericResponse();

        List<TeacherEnrollmentResponse> enrollments = teacherStudentBusiness.getTeacherEnrollments(response);

        ApiResponse<List<TeacherEnrollmentResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        apiResponse.setData(enrollments);

        return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    }

    @GetMapping(path = "enrollments/{idCourse}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<List<TeacherEnrollmentResponse>>> getTeacherEnrollmentsByCourse(
            @PathVariable String idCourse) {

        GenericResponse response = new GenericResponse();

        List<TeacherEnrollmentResponse> enrollments = teacherStudentBusiness.getTeacherEnrollmentsByCourse(
                idCourse,
                response);

        ApiResponse<List<TeacherEnrollmentResponse>> apiResponse = new ApiResponse<>();

        apiResponse.setResponse(response);
        apiResponse.setData(enrollments);

        return ResponseEntity.ok(apiResponse);
    }
}
