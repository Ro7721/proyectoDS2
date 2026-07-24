package com.epiis.DS26.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.DS26.business.CourseBusiness;
import com.epiis.DS26.dto.request.CourseRequest;
import com.epiis.DS26.dto.response.CourseCardResponse;
import com.epiis.DS26.dto.response.CourseResponse;
import com.epiis.DS26.entity.EntityCourse;
import com.epiis.DS26.message.ApiResponse;
import com.epiis.DS26.message.GenericResponse;

@RestController
@RequestMapping(path = "courses")
public class CourseController {
    private final CourseBusiness courseBusiness;

    public CourseController(CourseBusiness courseBusiness) {
        this.courseBusiness = courseBusiness;
    }

    @GetMapping(path = "list")
    public ResponseEntity<List<CourseResponse>> getAllCourses() {
        List<CourseResponse> courses = courseBusiness.findAllCourse();
        return ResponseEntity.ok(courses);
    }

    @PostMapping(path = "create", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<ApiResponse<CourseResponse>> createCourse(@ModelAttribute CourseRequest request) {
        GenericResponse response = new GenericResponse();
        EntityCourse course = courseBusiness.createCourse(request, response);
        ApiResponse<CourseResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (course != null) {
            apiResponse.setData(courseBusiness.mapToResponse(course));
            return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @GetMapping(path = "detail/{idCourse}", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<CourseResponse>> getById(@PathVariable String idCourse) {
        GenericResponse response = new GenericResponse();
        CourseResponse course = courseBusiness.getById(idCourse, response);
        ApiResponse<CourseResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (course != null) {
            apiResponse.setData(course);
            return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @PatchMapping(path = "publish/{idCourse}")
    public ResponseEntity<ApiResponse<CourseResponse>> publishCourse(@PathVariable String idCourse) {
        GenericResponse response = new GenericResponse();
        boolean success = courseBusiness.publish(idCourse, response);
        ApiResponse<CourseResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (success) {
            apiResponse.setData(courseBusiness.getById(idCourse, response));
            return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @PatchMapping(path = "unpublish/{idCourse}")
    public ResponseEntity<ApiResponse<CourseResponse>> unpublishCourse(@PathVariable String idCourse) {
        GenericResponse response = new GenericResponse();
        boolean success = courseBusiness.unpublish(idCourse, response);
        ApiResponse<CourseResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (success) {
            apiResponse.setData(courseBusiness.getById(idCourse, response));
            return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @DeleteMapping(path = "delete/{idCourse}")
    public ResponseEntity<ApiResponse<CourseResponse>> deleteCourse(@PathVariable String idCourse) {
        GenericResponse response = new GenericResponse();
        ApiResponse<CourseResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (courseBusiness.deleteCourse(idCourse, response)) {
            return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @GetMapping(path = "teacher/{teacherId}", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<List<CourseResponse>>> findByTeacher(
            @PathVariable String teacherId) {
        GenericResponse response = new GenericResponse();
        List<CourseResponse> courses = courseBusiness.findByTeacherCourse(teacherId);
        ApiResponse<List<CourseResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (courses.isEmpty()) {
            response.warning();
            response.listMessage.add("No se encontraron cursos");
            return ResponseEntity.badRequest().body(apiResponse);
        }
        apiResponse.setData(courses);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping(path = "teacher/{teacherId}/withlessons", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<List<CourseResponse>>> findByTeacherWithLessons(
            @PathVariable("teacherId") String teacherId) {
        GenericResponse response = new GenericResponse();
        List<CourseResponse> courses = courseBusiness.getCoursesWithLessonsAndFilesByTeacher(teacherId, response);
        ApiResponse<List<CourseResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (courses == null) {
            return ResponseEntity.badRequest().body(apiResponse);
        }
        apiResponse.setData(courses);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping(path = "public-courses", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<List<CourseCardResponse>>> getPublicCourses() {
        GenericResponse response = new GenericResponse();
        List<CourseCardResponse> courses = courseBusiness.findAllPublishedCourses();
        ApiResponse<List<CourseCardResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (courses.isEmpty()) {
            response.warning();
            response.listMessage.add("No se encontraron cursos");
            return ResponseEntity.badRequest().body(apiResponse);
        }
        response.success();
        apiResponse.setData(courses);
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping(path = "search/{value}")
    public ResponseEntity<ApiResponse<List<CourseResponse>>> searchCourses(@PathVariable String value) {
        GenericResponse response = new GenericResponse();
        List<CourseResponse> courses = courseBusiness.searchCourses(value, response);
        ApiResponse<List<CourseResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (courses == null || courses.isEmpty()) {
            return ResponseEntity.badRequest().body(apiResponse);
        }
        apiResponse.setData(courses);
        return ResponseEntity.ok(apiResponse);
    }
}
