package com.epiis.ds26.business;

import com.epiis.ds26.dto.request.EnrollmentRequest;
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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

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
        teacher = new EntityUser();
        teacher.setIdUser("teacher-1");
        teacher.setFirstName("Prof");
        teacher.setLastName("Gonzalez");
        teacher.setRole(ERole.ROLE_TEACHER);

        student = new EntityUser();
        student.setIdUser("student-1");
        student.setFirstName("Ana");
        student.setLastName("Torres");
        student.setRole(ERole.ROLE_STUDENT);

        EntityCategory category = new EntityCategory();
        category.setIdCategory("cat-1");
        category.setName("ProgramaciÃ³n");

        course = new EntityCourse();
        course.setIdCourse("course-1");
        course.setTitle("Java Avanzado");
        course.setDescription("Curso de Java");
        course.setStatus(EStatus.PUBLISHED);
        course.setTeacher(teacher);
        course.setCategory(category);
        course.setLessons(Collections.emptyList());
        course.setEnrollments(Collections.emptyList());

        enrollment = new EntityEnrollment();
        enrollment.setIdEnrollment("enroll-1");
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollment.setTotalProgress(50);
        enrollment.setCompleted(false);
    }

    // =========== enrollInCourse ===========

    @Test
    void enrollInCourse_validRequest_enrollsSuccessfully() {
        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(courseRepo.findById("course-1")).thenReturn(Optional.of(course));
        when(enrollmentRepo.existsByStudent_idUserAndCourse_idCourse("student-1", "course-1")).thenReturn(false);
        when(enrollmentRepo.save(any(EntityEnrollment.class))).thenReturn(enrollment);

        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId("course-1");

        GenericResponse response = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, response);

        assertNotNull(result);
        assertEquals("success", response.getType());
        assertTrue(response.listMessage.contains("Te has inscrito en el curso exitosamente"));
    }

    @Test
    void enrollInCourse_nullCourseId_returnsNull() {
        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId(null);

        GenericResponse response = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
        assertTrue(response.listMessage.contains("El ID del curso es requerido para la inscripciÃ³n"));
    }

    @Test
    void enrollInCourse_emptyCourseId_returnsNull() {
        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId("  ");

        GenericResponse response = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void enrollInCourse_nonExistentCourse_returnsNull() {
        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(courseRepo.findById("bad-course")).thenReturn(Optional.empty());

        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId("bad-course");

        GenericResponse response = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
    }

    @Test
    void enrollInCourse_courseNotPublished_returnsNull() {
        course.setStatus(EStatus.DRAFT);
        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(courseRepo.findById("course-1")).thenReturn(Optional.of(course));

        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId("course-1");

        GenericResponse response = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
        assertTrue(response.listMessage.contains("El curso no esta publicado"));
    }

    @Test
    void enrollInCourse_alreadyEnrolled_returnsNull() {
        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(courseRepo.findById("course-1")).thenReturn(Optional.of(course));
        when(enrollmentRepo.existsByStudent_idUserAndCourse_idCourse("student-1", "course-1")).thenReturn(true);

        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId("course-1");

        GenericResponse response = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
        assertTrue(response.listMessage.contains("El estudiante ya estÃ¡ inscrito en este curso"));
    }

    @Test
    void enrollInCourse_teacherEnrollsOwnCourse_returnsNull() {
        teacher.setRole(ERole.ROLE_STUDENT); // Teacher acting as student
        teacher.setIdUser("teacher-1");
        course.setTeacher(teacher);
        when(authenticationBusiness.getCurrentUser()).thenReturn(teacher);
        when(courseRepo.findById("course-1")).thenReturn(Optional.of(course));

        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId("course-1");

        GenericResponse response = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
        assertTrue(response.listMessage.contains("El estudiante no puede inscribirse en su propio curso"));
    }

    @Test
    void enrollInCourse_adminRole_notAllowed() {
        student.setRole(ERole.ROLE_ADMIN);
        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(courseRepo.findById("course-1")).thenReturn(Optional.of(course));

        EnrollmentRequest request = new EnrollmentRequest();
        request.setCourseId("course-1");

        GenericResponse response = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.enrollInCourse(request, response);

        assertNull(result);
        assertEquals("warning", response.getType());
        assertTrue(response.listMessage.contains("Solo un alumno puede inscribirse."));
    }

    // =========== getEnrollmentById ===========

    @Test
    void getEnrollmentById_exists_returnsResponse() {
        when(enrollmentRepo.findById("enroll-1")).thenReturn(Optional.of(enrollment));

        EnrollmentResponse result = enrollmentBusiness.getEnrollmentById("enroll-1");

        assertNotNull(result);
        assertEquals("enroll-1", result.getIdEnrollment());
        assertEquals("student-1", result.getStudentId());
        assertEquals("course-1", result.getCourseId());
    }

    @Test
    void getEnrollmentById_notFound_returnsNull() {
        when(enrollmentRepo.findById("bad")).thenReturn(Optional.empty());

        EnrollmentResponse result = enrollmentBusiness.getEnrollmentById("bad");

        assertNull(result);
    }

    // =========== getAllEnrollments ===========

    @Test
    void getAllEnrollments_returnsMappedList() {
        when(enrollmentRepo.findAll()).thenReturn(Arrays.asList(enrollment));

        List<EnrollmentResponse> result = enrollmentBusiness.getAllEnrollments();

        assertEquals(1, result.size());
        assertEquals("enroll-1", result.get(0).getIdEnrollment());
    }

    @Test
    void getAllEnrollments_empty_returnsEmptyList() {
        when(enrollmentRepo.findAll()).thenReturn(Collections.emptyList());

        List<EnrollmentResponse> result = enrollmentBusiness.getAllEnrollments();

        assertTrue(result.isEmpty());
    }

    // =========== deleteEnrollment ===========

    @Test
    void deleteEnrollment_existing_deletesSuccessfully() {
        when(enrollmentRepo.findById("enroll-1")).thenReturn(Optional.of(enrollment));

        GenericResponse response = new GenericResponse();
        boolean result = enrollmentBusiness.deleteEnrollment("enroll-1", response);

        assertTrue(result);
        assertEquals("success", response.getType());
        verify(enrollmentRepo).delete(enrollment);
    }

    @Test
    void deleteEnrollment_notFound_returnsFalse() {
        when(enrollmentRepo.findById("bad")).thenReturn(Optional.empty());

        GenericResponse response = new GenericResponse();
        boolean result = enrollmentBusiness.deleteEnrollment("bad", response);

        assertFalse(result);
        assertEquals("warning", response.getType());
        assertTrue(response.listMessage.contains("InscripciÃ³n no encontrada"));
    }

    // =========== updateProgress ===========

    @Test
    void updateProgress_validEnrollment_updatesProgress() {
        when(enrollmentRepo.findById("enroll-1")).thenReturn(Optional.of(enrollment));
        when(enrollmentRepo.save(any())).thenReturn(enrollment);

        GenericResponse response = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.updateProgress("enroll-1", 75, response);

        assertNotNull(result);
        assertEquals("success", response.getType());
        assertTrue(response.listMessage.contains("Progreso actualizado exitosamente"));
    }

    @Test
    void updateProgress_100percent_setsCompleted() {
        when(enrollmentRepo.findById("enroll-1")).thenReturn(Optional.of(enrollment));
        when(enrollmentRepo.save(any(EntityEnrollment.class))).thenAnswer(inv -> inv.getArgument(0));

        GenericResponse response = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.updateProgress("enroll-1", 100, response);

        assertNotNull(result);
        assertTrue(result.isCompleted());
    }

    @Test
    void updateProgress_notFound_returnsNull() {
        when(enrollmentRepo.findById("bad")).thenReturn(Optional.empty());

        GenericResponse response = new GenericResponse();
        EntityEnrollment result = enrollmentBusiness.updateProgress("bad", 50, response);

        assertNull(result);
        assertEquals("warning", response.getType());
        assertTrue(response.listMessage.contains("InscripciÃ³n no encontrada"));
    }

    // =========== isEnrolled ===========

    @Test
    void isEnrolled_true_whenStudentIsEnrolled() {
        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(enrollmentRepo.existsByStudent_idUserAndCourse_idCourse("student-1", "course-1")).thenReturn(true);

        boolean result = enrollmentBusiness.isEnrolled("course-1");

        assertTrue(result);
    }

    @Test
    void isEnrolled_false_whenStudentNotEnrolled() {
        when(authenticationBusiness.getCurrentUser()).thenReturn(student);
        when(enrollmentRepo.existsByStudent_idUserAndCourse_idCourse("student-1", "course-1")).thenReturn(false);

        boolean result = enrollmentBusiness.isEnrolled("course-1");

        assertFalse(result);
    }

    // =========== mapToResponse ===========

    @Test
    void mapToResponse_mapsAllFieldsCorrectly() {
        EnrollmentResponse result = enrollmentBusiness.mapToResponse(enrollment);

        assertEquals("enroll-1", result.getIdEnrollment());
        assertEquals("student-1", result.getStudentId());
        assertEquals("course-1", result.getCourseId());
        assertEquals("Ana Torres", result.getStudentName());
        assertEquals("Java Avanzado", result.getCourseTitle());
        assertEquals(50, result.getTotalProgress());
        assertFalse(result.isCompleted());
    }

    // =========== getEnrollmentReport ===========

    @Test
    void getEnrollmentReport_returnsStudentEnrollments() {
        when(enrollmentRepo.findByStudent_idUser("student-1"))
                .thenReturn(Collections.singletonList(enrollment));

        List<EnrollmentResponse> result = enrollmentBusiness.getEnrollmentReport("student-1");

        assertEquals(1, result.size());
        assertEquals("student-1", result.get(0).getStudentId());
    }
}
