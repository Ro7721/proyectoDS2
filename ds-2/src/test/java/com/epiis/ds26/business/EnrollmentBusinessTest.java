package com.epiis.ds26.business;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
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

import com.epiis.ds26.dto.request.EnrollmentRequest;
import com.epiis.ds26.dto.response.CertificateResponse;
import com.epiis.ds26.dto.response.EnrollmentResponse;
import com.epiis.ds26.dto.response.MyCourseResponse;
import com.epiis.ds26.entity.EntityCategory;
import com.epiis.ds26.entity.EntityCourse;
import com.epiis.ds26.entity.EntityEnrollment;
import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.enums.ERole;
import com.epiis.ds26.enums.EStatus;
import com.epiis.ds26.message.GenericResponse;
import com.epiis.ds26.repositorie.CourseRepo;
import com.epiis.ds26.repositorie.EnrollmentRepo;

@ExtendWith(MockitoExtension.class)
class EnrollmentBusinessTest {

    @Mock
    private EnrollmentRepo enrollmentRepo;

    @Mock
    private AuthenticationBusiness authenticationBusiness;

    @Mock
    private CourseRepo courseRepo;

    @InjectMocks
    private EnrollmentBusiness enrollmentBusiness;

    private EntityUser student;
    private EntityUser teacher;
    private EntityCourse course;
    private EntityEnrollment enrollment;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(enrollmentBusiness, "baseUrl", "http://localhost:8080");

        student = new EntityUser();
        student.setIdUser("stud-1");
        student.setFirstName("Ana");
        student.setLastName("Torres");
        student.setRole(ERole.ROLE_STUDENT);

        teacher = new EntityUser();
        teacher.setIdUser("teach-1");
        teacher.setFirstName("Juan");
        teacher.setLastName("Perez");
        teacher.setRole(ERole.ROLE_TEACHER);

        EntityCategory category = new EntityCategory();
        category.setName("Programming");

        course = new EntityCourse();
        course.setIdCourse("cour-1");
        course.setTitle("Java Basics");
        course.setDescription("Learn Java");
        course.setCoverImage("java.jpg");
        course.setStatus(EStatus.PUBLISHED);
        course.setTeacher(teacher);
        course.setCategory(category);
        course.setLessons(Collections.emptyList());

        enrollment = new EntityEnrollment();
        enrollment.setIdEnrollment("enr-1");
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollment.setLastAccess(LocalDateTime.now());
        enrollment.setTotalProgress(50);
        enrollment.setCompleted(false);
    }

    @Test
    void isEnrolled_returnsTrue() {
        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(enrollmentRepo.existsByStudent_idUserAndCourse_idCourse("stud-1", "cour-1")).thenReturn(true);

        boolean enrolled = enrollmentBusiness.isEnrolled("cour-1");
        assertTrue(enrolled);
    }

    @Test
    void enrollInCourse_validRequest_success() {
        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId("cour-1");

        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(courseRepo.findById("cour-1")).thenReturn(Optional.of(course));
        when(enrollmentRepo.existsByStudent_idUserAndCourse_idCourse("stud-1", "cour-1")).thenReturn(false);
        when(enrollmentRepo.save(any(EntityEnrollment.class))).thenReturn(enrollment);

        GenericResponse message = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, message);

        assertNotNull(result);
        assertEquals("success", message.getType());
    }

    @Test
    void enrollInCourse_missingCourseId_warning() {
        EnrollmentRequest request = new EnrollmentRequest();
        GenericResponse message = new GenericResponse();

        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, message);

        assertNull(result);
        assertEquals("warning", message.getType());
    }

    @Test
    void enrollInCourse_invalidRole_warning() {
        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId("cour-1");
        student.setRole(ERole.ROLE_TEACHER);

        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(courseRepo.findById("cour-1")).thenReturn(Optional.of(course));

        GenericResponse message = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, message);

        assertNull(result);
        assertEquals("warning", message.getType());
    }

    @Test
    void enrollInCourse_courseNotPublished_warning() {
        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId("cour-1");
        course.setStatus(EStatus.DRAFT);

        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(courseRepo.findById("cour-1")).thenReturn(Optional.of(course));

        GenericResponse message = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, message);

        assertNull(result);
        assertEquals("warning", message.getType());
    }

    @Test
    void enrollInCourse_teacherSelfEnroll_warning() {
        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId("cour-1");
        student.setIdUser("teach-1"); // student has same id as teacher

        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(courseRepo.findById("cour-1")).thenReturn(Optional.of(course));

        GenericResponse message = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, message);

        assertNull(result);
        assertEquals("warning", message.getType());
    }

    @Test
    void enrollInCourse_alreadyEnrolled_warning() {
        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId("cour-1");

        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(courseRepo.findById("cour-1")).thenReturn(Optional.of(course));
        when(enrollmentRepo.existsByStudent_idUserAndCourse_idCourse("stud-1", "cour-1")).thenReturn(true);

        GenericResponse message = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, message);

        assertNull(result);
        assertEquals("warning", message.getType());
    }

    @Test
    void getEnrollmentById_exists_returnsResponse() {
        when(enrollmentRepo.findById("enr-1")).thenReturn(Optional.of(enrollment));

        EnrollmentResponse result = enrollmentBusiness.getEnrollmentById("enr-1");

        assertNotNull(result);
        assertEquals("stud-1", result.getStudentId());
    }

    @Test
    void getEnrollmentById_notExists_returnsNull() {
        when(enrollmentRepo.findById("enr-1")).thenReturn(Optional.empty());

        EnrollmentResponse result = enrollmentBusiness.getEnrollmentById("enr-1");

        assertNull(result);
    }

    @Test
    void getAllEnrollments_returnsList() {
        when(enrollmentRepo.findAll()).thenReturn(List.of(enrollment));

        List<EnrollmentResponse> result = enrollmentBusiness.getAllEnrollments();

        assertEquals(1, result.size());
    }

    @Test
    void deleteEnrollment_exists_success() {
        when(enrollmentRepo.findById("enr-1")).thenReturn(Optional.of(enrollment));

        GenericResponse message = new GenericResponse();
        boolean result = enrollmentBusiness.deleteEnrollment("enr-1", message);

        assertTrue(result);
        assertEquals("success", message.getType());
    }

    @Test
    void deleteEnrollment_emptyId_warning() {
        GenericResponse message = new GenericResponse();
        boolean result = enrollmentBusiness.deleteEnrollment("", message);

        assertFalse(result);
        assertEquals("warning", message.getType());
    }

    @Test
    void deleteEnrollment_notExists_warning() {
        when(enrollmentRepo.findById("enr-1")).thenReturn(Optional.empty());

        GenericResponse message = new GenericResponse();
        boolean result = enrollmentBusiness.deleteEnrollment("enr-1", message);

        assertFalse(result);
        assertEquals("warning", message.getType());
    }

    @Test
    void updateProgress_exists_success() {
        when(enrollmentRepo.findById("enr-1")).thenReturn(Optional.of(enrollment));
        when(enrollmentRepo.save(any(EntityEnrollment.class))).thenReturn(enrollment);

        GenericResponse message = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.updateProgress("enr-1", 100, message);

        assertNotNull(result);
        assertEquals("success", message.getType());
    }

    @Test
    void updateProgress_emptyId_warning() {
        GenericResponse message = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.updateProgress("", 50, message);

        assertNull(result);
        assertEquals("warning", message.getType());
    }

    @Test
    void updateProgress_notExists_warning() {
        when(enrollmentRepo.findById("enr-1")).thenReturn(Optional.empty());

        GenericResponse message = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.updateProgress("enr-1", 50, message);

        assertNull(result);
        assertEquals("warning", message.getType());
    }

    @Test
    void getEnrollmentReport_returnsList() {
        when(enrollmentRepo.findByStudent_idUser("stud-1")).thenReturn(List.of(enrollment));

        List<EnrollmentResponse> result = enrollmentBusiness.getEnrollmentReport("stud-1");

        assertEquals(1, result.size());
    }

    @Test
    void getMyCourses_returnsList() {
        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(enrollmentRepo.findByStudent_idUserOrderByLastAccessDesc("stud-1")).thenReturn(List.of(enrollment));

        List<MyCourseResponse> result = enrollmentBusiness.getMyCouses();

        assertEquals(1, result.size());
        assertEquals("Java Basics", result.get(0).getTitle());
    }

    @Test
    void getCertificate_notEnrolled_warning() {
        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(enrollmentRepo.findByStudent_idUserAndCourse_idCourse("stud-1", "cour-1")).thenReturn(Optional.empty());

        GenericResponse message = new GenericResponse();
        CertificateResponse result = enrollmentBusiness.getCertificate("cour-1", message);

        assertNull(result);
        assertEquals("warning", message.getType());
    }

    @Test
    void getCertificate_notCompleted_warning() {
        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(enrollmentRepo.findByStudent_idUserAndCourse_idCourse("stud-1", "cour-1")).thenReturn(Optional.of(enrollment));

        GenericResponse message = new GenericResponse();
        CertificateResponse result = enrollmentBusiness.getCertificate("cour-1", message);

        assertNull(result);
        assertEquals("warning", message.getType());
    }

    @Test
    void getCertificate_completed_success() {
        enrollment.setCompleted(true);
        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(enrollmentRepo.findByStudent_idUserAndCourse_idCourse("stud-1", "cour-1")).thenReturn(Optional.of(enrollment));

        GenericResponse message = new GenericResponse();
        CertificateResponse result = enrollmentBusiness.getCertificate("cour-1", message);

        assertNotNull(result);
        assertEquals("success", message.getType());
        assertEquals("Java Basics", result.getCourseName());
    }
}
