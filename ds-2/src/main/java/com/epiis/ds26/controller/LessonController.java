package com.epiis.ds26.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.ds26.business.LessonBusiness;
import com.epiis.ds26.dto.request.LessonRequest;
import com.epiis.ds26.dto.response.LessonResponse;
import com.epiis.ds26.entity.EntityLesson;
import com.epiis.ds26.message.ApiResponse;
import com.epiis.ds26.message.GenericResponse;

@RestController
@RequestMapping(path = "lessons")
public class LessonController {
    private final LessonBusiness lessonBusiness;

    public LessonController(LessonBusiness lessonBusiness) {
        this.lessonBusiness = lessonBusiness;
    }

    @PostMapping(path = "insert", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<ApiResponse<LessonResponse>> create(LessonRequest request) {
        GenericResponse response = new GenericResponse();
        EntityLesson lesson = lessonBusiness.insert(request, request.getMainVideoFile(), request.getAdjunctFiles(),
                response);
        ApiResponse<LessonResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (lesson == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
        }
        apiResponse.setData(lessonBusiness.mapToResponse(lesson));
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }

    @PutMapping(path = "update/{idLesson}", consumes = { MediaType.MULTIPART_FORM_DATA_VALUE })
    public ResponseEntity<ApiResponse<LessonResponse>> update(
            @PathVariable String idLesson, 
            LessonRequest request) {
        GenericResponse response = new GenericResponse();
        EntityLesson lesson = lessonBusiness.updateLesson(idLesson, request, request.getMainVideoFile(), request.getAdjunctFiles(), response);
        ApiResponse<LessonResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (lesson == null) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
        }
        apiResponse.setData(lessonBusiness.mapToResponse(lesson));
        return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
    }

    @GetMapping(path = "list", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<LessonResponse>> getAllLessons() {
        List<LessonResponse> lessn = lessonBusiness.getLesson();
        return ResponseEntity.ok(lessn);
    }

    @DeleteMapping(path = "delete/{idLesson}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<LessonResponse>> delete(@PathVariable String idLesson) {
        GenericResponse response = new GenericResponse();
        ApiResponse<LessonResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (lessonBusiness.deleteLesson(idLesson, response)) {
            return ResponseEntity.status(HttpStatus.OK).body(apiResponse);
        }
        return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
    }

    @GetMapping(path = "list/teacher/{teacherId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<LessonResponse>> getLessonsByTeacher(@PathVariable String teacherId) {
        List<LessonResponse> lessn = lessonBusiness.getLessonsByTeacher(teacherId);
        return ResponseEntity.ok(lessn);
    }

    @GetMapping(path = "list/course-teacher/{courseId}/{teacherId}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<List<LessonResponse>> getLessonsByCourseAndTeacher(@PathVariable String courseId,
            @PathVariable String teacherId) {
        List<LessonResponse> lessn = lessonBusiness.getLessonsByCourseAndTeacher(courseId, teacherId);
        return ResponseEntity.ok(lessn);
    }

    @GetMapping(path = "search/{value}", produces = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<List<LessonResponse>>> searchLessons(@PathVariable String value) {

        GenericResponse response = new GenericResponse();
        List<LessonResponse> lessn = lessonBusiness.searchLessons(value, response);

        ApiResponse<List<LessonResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        apiResponse.setData(lessn);

        if (lessn == null || lessn.isEmpty()) {
            return ResponseEntity.badRequest().body(apiResponse);
        }
        return ResponseEntity.ok(apiResponse);
    }
}
