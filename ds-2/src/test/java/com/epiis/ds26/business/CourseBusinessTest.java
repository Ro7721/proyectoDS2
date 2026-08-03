package com.epiis.ds26.business;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.test.util.ReflectionTestUtils;

import com.epiis.ds26.dto.request.CourseRequest;
import com.epiis.ds26.dto.response.CourseCardResponse;
import com.epiis.ds26.dto.response.CourseResponse;
import com.epiis.ds26.entity.EntityCategory;
import com.epiis.ds26.entity.EntityCourse;
import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.enums.ELevel;
import com.epiis.ds26.enums.EStatus;
import com.epiis.ds26.message.GenericResponse;
import com.epiis.ds26.repositorie.CourseRepo;
import com.epiis.ds26.repositorie.LessonFileRepo;
import com.epiis.ds26.repositorie.LessonRepo;

@ExtendWith(MockitoExtension.class)
class CourseBusinessTest {

    @Mock
    private CourseRepo courseRepo;

    @Mock
    private LessonRepo lessonRepo;

    @Mock
    private LessonFileRepo lessonFileRepo;

    @InjectMocks
    private CourseBusiness courseBusiness;

    private EntityCourse sampleCourse;
    private CourseRequest sampleRequest;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(courseBusiness, "baseUrl", "http://localhost:8080");
        ReflectionTestUtils.setField(courseBusiness, "storagePath", "target/test-storage");

        EntityUser teacher = new EntityUser();
        teacher.setIdUser("teacher-123");
        teacher.setFirstName("Ana");
        teacher.setLastName("Gomez");

        EntityCategory category = new EntityCategory();
        category.setIdCategory("cat-123");
        category.setName("Technology");

        sampleCourse = new EntityCourse();
        sampleCourse.setIdCourse("course-123");
        sampleCourse.setTitle("Course Title 1");
        sampleCourse.setDescription("This is a valid description");
        sampleCourse.setCoverImage("image.png");
        sampleCourse.setLevel(ELevel.BASIC);
        sampleCourse.setPrice(10.0);
        sampleCourse.setStatus(EStatus.DRAFT);
        sampleCourse.setTeacher(teacher);
        sampleCourse.setCategory(category);
        sampleCourse.setCreatedAt(LocalDateTime.now());
        sampleCourse.setUpdatedAt(LocalDateTime.now());

        sampleRequest = new CourseRequest();
        sampleRequest.setTitle("Course Title 1");
        sampleRequest.setDescription("This is a valid description");
        MockMultipartFile file = new MockMultipartFile("file", "image.png", "image/png", "content".getBytes());
        sampleRequest.setCoverImage(file);
        sampleRequest.setLevel("BASIC");
        sampleRequest.setPrice(10.0);
        sampleRequest.setStatus("DRAFT");
        sampleRequest.setIdTeacher("teacher-123");
        sampleRequest.setIdCategory("cat-123");
    }

    @Test
    void createCourse_validRequest_success() {
        when(courseRepo.save(any(EntityCourse.class))).thenReturn(sampleCourse);
        GenericResponse response = new GenericResponse();

        EntityCourse result = courseBusiness.createCourse(sampleRequest, response);

        assertNotNull(result);
        assertEquals("success", response.getType());
        verify(courseRepo).save(any(EntityCourse.class));
    }

    @Test
    void createCourse_invalidTitle_returnsNull() {
        sampleRequest.setTitle("123"); // only numbers or too short
        GenericResponse response = new GenericResponse();

        EntityCourse result = courseBusiness.createCourse(sampleRequest, response);

        assertNull(result);
        assertEquals("warning", response.getType());
        verify(courseRepo, never()).save(any());
    }

    @Test
    void getById_exists_returnsResponse() {
        when(courseRepo.findById("course-123")).thenReturn(Optional.of(sampleCourse));
        GenericResponse response = new GenericResponse();

        CourseResponse result = courseBusiness.getById("course-123", response);

        assertNotNull(result);
        assertEquals("course-123", result.getIdCourse());
        assertEquals("Course Title 1", result.getTitle());
    }

    @Test
    void getById_notFound_returnsNull() {
        when(courseRepo.findById("bad-id")).thenReturn(Optional.empty());
        GenericResponse response = new GenericResponse();

        CourseResponse result = courseBusiness.getById("bad-id", response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void publish_courseExistsWithLessons_success() {
        when(courseRepo.findById("course-123")).thenReturn(Optional.of(sampleCourse));
        when(lessonRepo.countByCourse_IdCourse("course-123")).thenReturn(5L);
        GenericResponse response = new GenericResponse();

        boolean result = courseBusiness.publish("course-123", response);

        assertTrue(result);
        assertEquals(EStatus.PUBLISHED, sampleCourse.getStatus());
        verify(courseRepo).save(sampleCourse);
    }

    @Test
    void publish_courseNoLessons_returnsFalse() {
        when(courseRepo.findById("course-123")).thenReturn(Optional.of(sampleCourse));
        when(lessonRepo.countByCourse_IdCourse("course-123")).thenReturn(0L);
        GenericResponse response = new GenericResponse();

        boolean result = courseBusiness.publish("course-123", response);

        assertFalse(result);
        assertEquals("warning", response.getType());
        verify(courseRepo, never()).save(any());
    }

    @Test
    void unpublish_courseExists_success() {
        sampleCourse.setStatus(EStatus.PUBLISHED);
        when(courseRepo.findById("course-123")).thenReturn(Optional.of(sampleCourse));
        GenericResponse response = new GenericResponse();

        boolean result = courseBusiness.unpublish("course-123", response);

        assertTrue(result);
        assertEquals(EStatus.DRAFT, sampleCourse.getStatus());
        verify(courseRepo).save(sampleCourse);
    }

    @Test
    void deleteCourse_courseExistsNoEnrollments_success() {
        when(courseRepo.findById("course-123")).thenReturn(Optional.of(sampleCourse));
        sampleCourse.setEnrollments(Collections.emptyList());
        GenericResponse response = new GenericResponse();

        boolean result = courseBusiness.deleteCourse("course-123", response);

        assertTrue(result);
        verify(courseRepo).delete(sampleCourse);
    }

    @Test
    void updateCourse_validRequest_success() {
        when(courseRepo.findById("course-123")).thenReturn(Optional.of(sampleCourse));
        when(courseRepo.save(any(EntityCourse.class))).thenReturn(sampleCourse);
        GenericResponse response = new GenericResponse();

        EntityCourse result = courseBusiness.updateCourse("course-123", sampleRequest, response);

        assertNotNull(result);
        assertEquals("success", response.getType());
    }

    @Test
    void findAllCourse_returnsList() {
        when(courseRepo.findAll()).thenReturn(Arrays.asList(sampleCourse));
        List<CourseResponse> result = courseBusiness.findAllCourse();
        assertEquals(1, result.size());
    }

    @Test
    void findByTeacherCourse_returnsList() {
        when(courseRepo.findByTeacher(any())).thenReturn(Arrays.asList(sampleCourse));
        List<CourseResponse> result = courseBusiness.findByTeacherCourse("teacher-123");
        assertEquals(1, result.size());
    }

    @Test
    void searchCourses_validSearch_returnsMatchingCourses() {
        when(courseRepo.findAllPublishedCoursesForSearch()).thenReturn(Arrays.asList(sampleCourse));
        GenericResponse response = new GenericResponse();

        List<CourseResponse> result = courseBusiness.searchCourses("Course", response);

        assertEquals(1, result.size());
        assertEquals("success", response.getType());
    }

    @Test
    void findAllPublishedCourses_returnsCards() {
        when(courseRepo.findAllPublishedCourses()).thenReturn(Arrays.asList(sampleCourse));
        sampleCourse.setLessons(Collections.emptyList());

        List<CourseCardResponse> result = courseBusiness.findAllPublishedCourses();

        assertEquals(1, result.size());
        assertEquals("course-123", result.get(0).getIdCourse());
    }
}
