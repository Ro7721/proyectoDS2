package com.epiis.ds26.repositorie;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.epiis.ds26.entity.EntityEnrollment;

public interface EnrollmentRepo extends JpaRepository<EntityEnrollment, String> {
        // busca si el estudiante ya esta inscrito en el curso
        boolean existsByStudent_idUserAndCourse_idCourse(String studentId, String courseId);

        List<EntityEnrollment> findByStudent_idUser(String studentId);

        List<EntityEnrollment> findByStudent_idUserOrderByLastAccessDesc(String studentId);

        Optional<EntityEnrollment> findByStudent_idUserAndCourse_idCourse(String studentId, String courseId);

        List<EntityEnrollment> findByCourse_Teacher_IdUserOrderByEnrollmentDateDesc(String idTeacher);

        List<EntityEnrollment> findByCourse_IdCourseAndCourse_Teacher_IdUserOrderByEnrollmentDateDesc(
                        String idCourse,
                        String idTeacher);
}
