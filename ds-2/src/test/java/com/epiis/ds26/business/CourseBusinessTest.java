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
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.NullAndEmptySource;
import org.junit.jupiter.params.provider.ValueSource;
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
import com.epiis.ds26.entity.EntityEnrollment;
import com.epiis.ds26.entity.EntityLesson;
import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.enums.ELevel;
import com.epiis.ds26.enums.EStatus;
import com.epiis.ds26.enums.EType;
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

    // ---- Title validation edge cases ----

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = { "12345", "abc" })
    void createCourse_invalidTitle_returnsNull(String invalidTitle) {
        sampleRequest.setTitle(invalidTitle);
        GenericResponse response = new GenericResponse();

        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_onlyNumbersTitle_returnsNull() {
        sampleRequest.setTitle("12345");
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_shortTitle_returnsNull() {
        sampleRequest.setTitle("abc");
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_tooLongTitle_returnsNull() {
        sampleRequest.setTitle("A".repeat(101));
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    // ---- Description validation ----

    @ParameterizedTest
    @NullAndEmptySource
    @ValueSource(strings = { "1234567890", "abc" })
    void createCourse_invalidDescription_returnsNull(String invalidDescription) {
        sampleRequest.setDescription(invalidDescription);
        GenericResponse response = new GenericResponse();

        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_onlyNumbersDescription_returnsNull() {
        sampleRequest.setDescription("1234567890");
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_shortDescription_returnsNull() {
        sampleRequest.setDescription("abc");
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_tooLongDescription_returnsNull() {
        sampleRequest.setDescription("A".repeat(501));
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    // ---- Image/Level validation ----

    @Test
    void createCourse_nullImage_returnsNull() {
        sampleRequest.setCoverImage(null);
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_invalidImageFormat_returnsNull() {
        MockMultipartFile badFile = new MockMultipartFile("file", "image.txt", "text/plain", "content".getBytes());
        sampleRequest.setCoverImage(badFile);
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_nullLevel_returnsNull() {
        sampleRequest.setLevel(null);
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_invalidLevel_returnsNull() {
        sampleRequest.setLevel("INVALID_LEVEL");
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    // ---- Price/Status validation ----

    @Test
    void createCourse_negativePrice_returnsNull() {
        sampleRequest.setPrice(-1.0);
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_priceExceedsLimit_returnsNull() {
        sampleRequest.setPrice(10001.0);
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_nullStatus_returnsNull() {
        sampleRequest.setStatus(null);
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_invalidStatus_returnsNull() {
        sampleRequest.setStatus("INVALID_STATUS");
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_nullTeacher_returnsNull() {
        sampleRequest.setIdTeacher(null);
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    @Test
    void createCourse_nullCategory_returnsNull() {
        sampleRequest.setIdCategory(null);
        GenericResponse response = new GenericResponse();
        assertNull(courseBusiness.createCourse(sampleRequest, response));
        assertEquals("warning", response.getType());
    }

    // ---- getById ----

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

    // ---- publish ----

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
    void publish_courseNotFound_returnsFalse() {
        when(courseRepo.findById("bad-id")).thenReturn(Optional.empty());
        GenericResponse response = new GenericResponse();

        boolean result = courseBusiness.publish("bad-id", response);

        assertFalse(result);
        assertEquals("warning", response.getType());
    }

    // ---- unpublish ----

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
    void unpublish_courseNotFound_returnsFalse() {
        when(courseRepo.findById("bad-id")).thenReturn(Optional.empty());
        GenericResponse response = new GenericResponse();

        boolean result = courseBusiness.unpublish("bad-id", response);

        assertFalse(result);
        assertEquals("warning", response.getType());
    }

    // ---- deleteCourse ----

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
    void deleteCourse_emptyId_returnsFalse() {
        GenericResponse response = new GenericResponse();
        boolean result = courseBusiness.deleteCourse("", response);
        assertFalse(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void deleteCourse_courseNotFound_returnsFalse() {
        when(courseRepo.findById("bad-id")).thenReturn(Optional.empty());
        GenericResponse response = new GenericResponse();
        boolean result = courseBusiness.deleteCourse("bad-id", response);
        assertFalse(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void deleteCourse_courseWithEnrollments_returnsFalse() {
        EntityEnrollment enrollment = new EntityEnrollment();
        sampleCourse.setEnrollments(List.of(enrollment));
        when(courseRepo.findById("course-123")).thenReturn(Optional.of(sampleCourse));
        GenericResponse response = new GenericResponse();

        boolean result = courseBusiness.deleteCourse("course-123", response);

        assertFalse(result);
        assertEquals("warning", response.getType());
        verify(courseRepo, never()).delete(any());
    }

    // ---- updateCourse ----

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
    void updateCourse_validRequest_withImage_success() {
        MockMultipartFile imageFile = new MockMultipartFile("file", "cover.jpg", "image/jpeg", "imgcontent".getBytes());
        sampleRequest.setCoverImage(imageFile);
        when(courseRepo.findById("course-123")).thenReturn(Optional.of(sampleCourse));
        when(courseRepo.save(any(EntityCourse.class))).thenReturn(sampleCourse);
        GenericResponse response = new GenericResponse();

        EntityCourse result = courseBusiness.updateCourse("course-123", sampleRequest, response);

        assertNotNull(result);
        assertEquals("success", response.getType());
    }

    @Test
    void updateCourse_invalidRequest_returnsNull() {
        sampleRequest.setTitle("");
        GenericResponse response = new GenericResponse();
        EntityCourse result = courseBusiness.updateCourse("course-123", sampleRequest, response);
        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void updateCourse_courseNotFound_returnsNull() {
        when(courseRepo.findById("bad-id")).thenReturn(Optional.empty());
        GenericResponse response = new GenericResponse();
        EntityCourse result = courseBusiness.updateCourse("bad-id", sampleRequest, response);
        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void updateCourse_invalidImageFormat_returnsNull() {
        MockMultipartFile badFile = new MockMultipartFile("file", "image.bmp", "image/bmp", "content".getBytes());
        sampleRequest.setCoverImage(badFile);
        GenericResponse response = new GenericResponse();
        EntityCourse result = courseBusiness.updateCourse("course-123", sampleRequest, response);
        assertNull(result);
        assertEquals("warning", response.getType());
    }

    // ---- findAllCourse, findByTeacherCourse ----

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
    void findByCategoryName_returnsList() {
        EntityCategory category = new EntityCategory();
        when(courseRepo.findByCategoryName(any())).thenReturn(Arrays.asList(sampleCourse));
        List<CourseResponse> result = courseBusiness.findByCategoryName(category);
        assertEquals(1, result.size());
    }

    // ---- searchCourses ----

    @Test
    void searchCourses_validSearch_returnsMatchingCourses() {
        when(courseRepo.findAllPublishedCoursesForSearch()).thenReturn(Arrays.asList(sampleCourse));
        GenericResponse response = new GenericResponse();

        List<CourseResponse> result = courseBusiness.searchCourses("Course", response);

        assertEquals(1, result.size());
        assertEquals("success", response.getType());
    }

    @Test
    void searchCourses_noResults_returnsEmptyList() {
        when(courseRepo.findAllPublishedCoursesForSearch()).thenReturn(Collections.emptyList());
        GenericResponse response = new GenericResponse();

        List<CourseResponse> result = courseBusiness.searchCourses("nothing", response);

        assertTrue(result.isEmpty());
        assertEquals("warning", response.getType());
    }

    // ---- getCoursesWithLessonsAndFilesByTeacher ----

    @Test
    void getCoursesWithLessonsAndFilesByTeacher_emptyList_returnsEmpty() {
        when(courseRepo.findByTeacherId("teacher-123")).thenReturn(Collections.emptyList());
        GenericResponse response = new GenericResponse();

        List<CourseResponse> result = courseBusiness.getCoursesWithLessonsAndFilesByTeacher("teacher-123", response);

        assertTrue(result.isEmpty());
        assertEquals("warning", response.getType());
    }

    @Test
    void getCoursesWithLessonsAndFilesByTeacher_withCourses_returnsList() {
        EntityLesson lesson = new EntityLesson();
        lesson.setIdLesson("lesson-1");
        lesson.setTitle("Lesson 1");
        lesson.setDescription("Desc");
        lesson.setType(EType.VIDEO);
        lesson.setContentUrl("video.mp4");
        lesson.setDurationMinutes(10);
        lesson.setLessonOrder(1);
        lesson.setIsFree(false);
        lesson.setCreatedAt(LocalDateTime.now());

        when(courseRepo.findByTeacherId("teacher-123")).thenReturn(Arrays.asList(sampleCourse));
        when(lessonRepo.findByCourseId("course-123")).thenReturn(List.of(lesson));
        when(lessonFileRepo.findByLessonId("lesson-1")).thenReturn(Collections.emptyList());
        GenericResponse response = new GenericResponse();

        List<CourseResponse> result = courseBusiness.getCoursesWithLessonsAndFilesByTeacher("teacher-123", response);

        assertEquals(1, result.size());
        assertEquals("success", response.getType());
    }

    // ---- findAllPublishedCourses ----

    @Test
    void findAllPublishedCourses_returnsCards() {
        when(courseRepo.findAllPublishedCourses()).thenReturn(Arrays.asList(sampleCourse));
        sampleCourse.setLessons(Collections.emptyList());

        List<CourseCardResponse> result = courseBusiness.findAllPublishedCourses();

        assertEquals(1, result.size());
        assertEquals("course-123", result.get(0).getIdCourse());
    }
}
