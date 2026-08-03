package com.epiis.ds26.business;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.epiis.ds26.dto.request.LessonProgressRequest;
import com.epiis.ds26.dto.response.CourseContentResponse;
import com.epiis.ds26.dto.response.CourseProgressResponse;
import com.epiis.ds26.entity.*;
import com.epiis.ds26.enums.EType;
import com.epiis.ds26.message.GenericResponse;
import com.epiis.ds26.repositorie.EnrollmentRepo;
import com.epiis.ds26.repositorie.LessonProgressRepo;
import com.epiis.ds26.repositorie.LessonRepo;

@ExtendWith(MockitoExtension.class)
class LearningBusinessTest {

    @Mock
    private EnrollmentRepo enrollmentRepo;

    @Mock
    private LessonRepo lessonRepo;

    @Mock
    private LessonProgressRepo lessonProgressRepo;

    @Mock
    private AuthenticationBusiness auth;

    @InjectMocks
    private LearningBusiness learningBusiness;

    private EntityUser student;
    private EntityCourse course;
    private EntityEnrollment enrollment;
    private EntityLesson lesson;
    private EntityLessonFile lessonFile;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(learningBusiness, "baseUrl", "http://localhost:8080");

        student = new EntityUser();
        student.setIdUser("user-123");

        EntityUser teacher = new EntityUser();
        teacher.setFirstName("Teacher");
        teacher.setLastName("Name");

        EntityCategory category = new EntityCategory();
        category.setName("Category");

        course = new EntityCourse();
        course.setIdCourse("course-123");
        course.setTitle("Title");
        course.setDescription("Description");
        course.setCoverImage("img.png");
        course.setTeacher(teacher);
        course.setCategory(category);

        lesson = new EntityLesson();
        lesson.setIdLesson("lesson-1");
        lesson.setTitle("Lesson 1");
        lesson.setDescription("Lesson 1 Description");
        lesson.setType(EType.VIDEO);
        lesson.setContentUrl("vid.mp4");
        lesson.setDurationMinutes(5);
        lesson.setLessonOrder(1);
        lesson.setIsFree(true);
        lesson.setCourse(course);

        lessonFile = new EntityLessonFile();
        lessonFile.setIdFile("file-1");
        lessonFile.setFileName("slides.pdf");
        lessonFile.setFileType(EType.PDF);
        lessonFile.setFileUrl("slides.pdf");
        lessonFile.setFileOrder(1);
        lesson.setFiles(List.of(lessonFile));

        course.setLessons(List.of(lesson));

        enrollment = new EntityEnrollment();
        enrollment.setIdEnrollment("enrollment-123");
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setTotalProgress(0);
        enrollment.setCompleted(false);
    }

    @Test
    void getCourseContent_notAuthenticated_returnsNull() {
        when(auth.getCurrentUser()).thenReturn(null);
        GenericResponse response = new GenericResponse();

        CourseContentResponse dto = learningBusiness.getCourseContent("course-123", response);

        assertNull(dto);
        assertEquals("error", response.getType());
    }

    @Test
    void getCourseContent_notEnrolled_returnsNull() {
        when(auth.getCurrentUser()).thenReturn(student);
        when(enrollmentRepo.findByStudent_idUserAndCourse_idCourse("user-123", "course-123"))
                .thenReturn(Optional.empty());
        GenericResponse response = new GenericResponse();

        CourseContentResponse dto = learningBusiness.getCourseContent("course-123", response);

        assertNull(dto);
        assertEquals("error", response.getType());
    }

    @Test
    void getCourseContent_success() {
        when(auth.getCurrentUser()).thenReturn(student);
        when(enrollmentRepo.findByStudent_idUserAndCourse_idCourse("user-123", "course-123"))
                .thenReturn(Optional.of(enrollment));

        EntityLessonProgress progress = new EntityLessonProgress();
        progress.setLesson(lesson);
        progress.setWatchedPercentage(50);
        progress.setLastPositionSeconds(120);
        progress.setCompleted(false);

        when(lessonProgressRepo.findByEnrollment_IdEnrollment("enrollment-123"))
                .thenReturn(List.of(progress));

        GenericResponse response = new GenericResponse();

        CourseContentResponse dto = learningBusiness.getCourseContent("course-123", response);

        assertNotNull(dto);
        assertEquals("success", response.getType());
        assertEquals("course-123", dto.getIdCourse());
        assertEquals(1, dto.getLessons().size());
        assertEquals(50, dto.getLessons().get(0).getWatchedPercentage());
    }

    @Test
    void saveProgress_missingLessonId_warning() {
        LessonProgressRequest req = new LessonProgressRequest();
        req.setIdLesson("");

        GenericResponse response = new GenericResponse();
        CourseProgressResponse res = learningBusiness.saveProgress(req, response);

        assertNull(res);
        assertEquals("warning", response.getType());
    }

    @Test
    void saveProgress_lessonNotFound_warning() {
        LessonProgressRequest req = new LessonProgressRequest();
        req.setIdLesson("lesson-999");
        when(lessonRepo.findById("lesson-999")).thenReturn(Optional.empty());

        GenericResponse response = new GenericResponse();
        CourseProgressResponse res = learningBusiness.saveProgress(req, response);

        assertNull(res);
        assertEquals("warning", response.getType());
    }

    @Test
    void saveProgress_notEnrolled_error() {
        LessonProgressRequest req = new LessonProgressRequest();
        req.setIdLesson("lesson-1");
        when(lessonRepo.findById("lesson-1")).thenReturn(Optional.of(lesson));
        when(auth.getCurrentUser()).thenReturn(student);
        when(enrollmentRepo.findByStudent_idUserAndCourse_idCourse("user-123", "course-123"))
                .thenReturn(Optional.empty());

        GenericResponse response = new GenericResponse();
        CourseProgressResponse res = learningBusiness.saveProgress(req, response);

        assertNull(res);
        assertEquals("error", response.getType());
    }

    @Test
    void saveProgress_newProgress_success() {
        LessonProgressRequest req = new LessonProgressRequest();
        req.setIdLesson("lesson-1");
        req.setWatchedPercentage(50);
        req.setLastPositionSeconds(100);

        when(lessonRepo.findById("lesson-1")).thenReturn(Optional.of(lesson));
        when(auth.getCurrentUser()).thenReturn(student);
        when(enrollmentRepo.findByStudent_idUserAndCourse_idCourse("user-123", "course-123"))
                .thenReturn(Optional.of(enrollment));
        when(lessonProgressRepo.findByEnrollment_IdEnrollmentAndLesson_IdLesson("enrollment-123", "lesson-1"))
                .thenReturn(Optional.empty());
        when(lessonProgressRepo.countByEnrollment_IdEnrollmentAndIsCompletedTrue("enrollment-123")).thenReturn(0L);

        GenericResponse response = new GenericResponse();
        CourseProgressResponse res = learningBusiness.saveProgress(req, response);

        assertNotNull(res);
        assertEquals(50, res.getWatchedPercentage());
        assertEquals(100, res.getLastPositionSeconds());
        assertFalse(res.isLessonCompleted());
        assertEquals("success", response.getType());
    }

    @Test
    void saveProgress_completedProgress_success() {
        LessonProgressRequest req = new LessonProgressRequest();
        req.setIdLesson("lesson-1");
        req.setWatchedPercentage(95); // triggers completion >= 90
        req.setLastPositionSeconds(300);

        when(lessonRepo.findById("lesson-1")).thenReturn(Optional.of(lesson));
        when(auth.getCurrentUser()).thenReturn(student);
        when(enrollmentRepo.findByStudent_idUserAndCourse_idCourse("user-123", "course-123"))
                .thenReturn(Optional.of(enrollment));

        EntityLessonProgress existingProgress = new EntityLessonProgress();
        existingProgress.setWatchedPercentage(20);
        existingProgress.setLastPositionSeconds(60);
        existingProgress.setCompleted(false);

        when(lessonProgressRepo.findByEnrollment_IdEnrollmentAndLesson_IdLesson("enrollment-123", "lesson-1"))
                .thenReturn(Optional.of(existingProgress));
        when(lessonProgressRepo.countByEnrollment_IdEnrollmentAndIsCompletedTrue("enrollment-123")).thenReturn(1L);

        GenericResponse response = new GenericResponse();
        CourseProgressResponse res = learningBusiness.saveProgress(req, response);

        assertNotNull(res);
        assertTrue(res.isLessonCompleted());
        assertEquals(95, res.getWatchedPercentage());
        assertTrue(res.isCourseCompleted()); // completedLessons >= totalLessons (1 >= 1)
        assertEquals("success", response.getType());
    }

    @Test
    void saveProgress_zeroLessonsCourse_recalculatesToZeroProgress() {
        LessonProgressRequest req = new LessonProgressRequest();
        req.setIdLesson("lesson-1");
        req.setWatchedPercentage(50);

        course.setLessons(Collections.emptyList()); // zero lessons course
        when(lessonRepo.findById("lesson-1")).thenReturn(Optional.of(lesson));
        when(auth.getCurrentUser()).thenReturn(student);
        when(enrollmentRepo.findByStudent_idUserAndCourse_idCourse("user-123", "course-123"))
                .thenReturn(Optional.of(enrollment));
        when(lessonProgressRepo.findByEnrollment_IdEnrollmentAndLesson_IdLesson("enrollment-123", "lesson-1"))
                .thenReturn(Optional.of(new EntityLessonProgress()));

        GenericResponse response = new GenericResponse();
        CourseProgressResponse res = learningBusiness.saveProgress(req, response);

        assertNotNull(res);
        assertEquals(0, res.getTotalProgress());
        assertFalse(res.isCourseCompleted());
    }
}
