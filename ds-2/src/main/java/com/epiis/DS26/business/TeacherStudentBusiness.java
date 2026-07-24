package com.epiis.DS26.business;

import java.util.List;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import com.epiis.DS26.dto.response.TeacherEnrollmentResponse;
import com.epiis.DS26.entity.EntityEnrollment;
import com.epiis.DS26.entity.EntityUser;
import com.epiis.DS26.message.GenericResponse;
import com.epiis.DS26.repositorie.EnrollmentRepo;

@Service
public class TeacherStudentBusiness {

        private final EnrollmentRepo enrollmentRepo;
        private final AuthenticationBusiness auth;

        @Value("${app.base-url}")
        private String baseUrl;

        public TeacherStudentBusiness(EnrollmentRepo enrollmentRepo, AuthenticationBusiness auth) {
                this.enrollmentRepo = enrollmentRepo;
                this.auth = auth;
        }

        public List<TeacherEnrollmentResponse> getTeacherEnrollments(GenericResponse response) {
                EntityUser teacher = auth.getCurrentUser();

                List<EntityEnrollment> enrollments = enrollmentRepo
                                .findByCourse_Teacher_IdUserOrderByEnrollmentDateDesc(
                                                teacher.getIdUser());

                response.success();
                response.listMessage.add("Inscripciones obtenidas correctamente");

                return enrollments.stream()
                                .map(this::mapEnrollment)
                                .toList();
        }

        public List<TeacherEnrollmentResponse> getTeacherEnrollmentsByCourse(
                        String idCourse,
                        GenericResponse response) {

                EntityUser teacher = auth.getCurrentUser();

                List<EntityEnrollment> enrollments = enrollmentRepo
                                .findByCourse_IdCourseAndCourse_Teacher_IdUserOrderByEnrollmentDateDesc(
                                                idCourse,
                                                teacher.getIdUser());

                response.success();
                response.listMessage.add("Alumnos del curso obtenidos correctamente");

                return enrollments.stream()
                                .map(this::mapEnrollment)
                                .toList();
        }

        private TeacherEnrollmentResponse mapEnrollment(EntityEnrollment enrollment) {

                TeacherEnrollmentResponse dto = new TeacherEnrollmentResponse();

                dto.setIdEnrollment(enrollment.getIdEnrollment());

                dto.setIdStudent(enrollment.getStudent().getIdUser());
                dto.setStudentFullName(
                                enrollment.getStudent().getFirstName() + " " +
                                                enrollment.getStudent().getLastName());
                dto.setStudentEmail(enrollment.getStudent().getEmail());

                dto.setIdCourse(enrollment.getCourse().getIdCourse());
                dto.setCourseTitle(enrollment.getCourse().getTitle());

                dto.setCourseImage(
                                baseUrl + "/course-images/" +
                                                enrollment.getCourse().getCoverImage());

                dto.setTotalProgress(enrollment.getTotalProgress());
                dto.setCompleted(enrollment.isCompleted());

                dto.setEnrollmentDate(enrollment.getEnrollmentDate());
                dto.setLastAccess(enrollment.getLastAccess());

                return dto;
        }

}
