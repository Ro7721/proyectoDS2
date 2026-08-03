package com.epiis.ds26.business;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.time.LocalDateTime;
import java.util.List;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import com.epiis.ds26.dto.response.TeacherEnrollmentResponse;
import com.epiis.ds26.entity.EntityCourse;
import com.epiis.ds26.entity.EntityEnrollment;
import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.enums.ERole;
import com.epiis.ds26.message.GenericResponse;
import com.epiis.ds26.repositorie.EnrollmentRepo;

@ExtendWith(MockitoExtension.class)
class TeacherStudentBusinessTest {

    @Mock
    private EnrollmentRepo enrollmentRepo;

    @Mock
    private AuthenticationBusiness auth;

    @InjectMocks
    private TeacherStudentBusiness teacherStudentBusiness;

    private EntityUser teacher;
    private EntityUser student;
    private EntityCourse course;
    private EntityEnrollment enrollment;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(teacherStudentBusiness, "baseUrl", "http://localhost:8080");

        teacher = new EntityUser();
        teacher.setIdUser("teach-1");
        teacher.setFirstName("Juan");
        teacher.setLastName("Perez");
        teacher.setRole(ERole.ROLE_TEACHER);

        student = new EntityUser();
        student.setIdUser("stud-1");
        student.setFirstName("Ana");
        student.setLastName("Torres");
        student.setEmail("ana@gmail.com");
        student.setRole(ERole.ROLE_STUDENT);

        course = new EntityCourse();
        course.setIdCourse("cour-1");
        course.setTitle("Java Basics");
        course.setCoverImage("java.jpg");
        course.setTeacher(teacher);

        enrollment = new EntityEnrollment();
        enrollment.setIdEnrollment("enr-1");
        enrollment.setStudent(student);
        enrollment.setCourse(course);
        enrollment.setTotalProgress(40);
        enrollment.setCompleted(false);
        enrollment.setEnrollmentDate(LocalDateTime.now());
        enrollment.setLastAccess(LocalDateTime.now());
    }

    @Test
    void getTeacherEnrollments_returnsList() {
        when(auth.getCurrentUser()).thenReturn(teacher);
        when(enrollmentRepo.findByCourse_Teacher_IdUserOrderByEnrollmentDateDesc("teach-1")).thenReturn(List.of(enrollment));

        GenericResponse response = new GenericResponse();
        List<TeacherEnrollmentResponse> result = teacherStudentBusiness.getTeacherEnrollments(response);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("stud-1", result.get(0).getIdStudent());
        assertEquals("Ana Torres", result.get(0).getStudentFullName());
        assertEquals("http://localhost:8080/course-images/java.jpg", result.get(0).getCourseImage());
        assertEquals("success", response.getType());
    }

    @Test
    void getTeacherEnrollmentsByCourse_returnsList() {
        when(auth.getCurrentUser()).thenReturn(teacher);
        when(enrollmentRepo.findByCourse_IdCourseAndCourse_Teacher_IdUserOrderByEnrollmentDateDesc("cour-1", "teach-1")).thenReturn(List.of(enrollment));

        GenericResponse response = new GenericResponse();
        List<TeacherEnrollmentResponse> result = teacherStudentBusiness.getTeacherEnrollmentsByCourse("cour-1", response);

        assertNotNull(result);
        assertEquals(1, result.size());
        assertEquals("Java Basics", result.get(0).getCourseTitle());
        assertEquals("success", response.getType());
    }
}
