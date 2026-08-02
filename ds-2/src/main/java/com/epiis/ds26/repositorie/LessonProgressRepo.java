package com.epiis.ds26.repositorie;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.epiis.ds26.entity.EntityLessonProgress;

public interface LessonProgressRepo extends JpaRepository<EntityLessonProgress, String> {
    // Busca el progreso de una lecciÃ³n puntual dentro de una inscripciÃ³n
    Optional<EntityLessonProgress> findByEnrollment_IdEnrollmentAndLesson_IdLesson(String idEnrollment,
            String idLesson);

    // Cuenta cuÃ¡ntas lecciones completÃ³ el estudiante dentro de una inscripciÃ³n
    long countByEnrollment_IdEnrollmentAndIsCompletedTrue(String idEnrollment);

    List<EntityLessonProgress> findByEnrollment_IdEnrollment(String idEnrollment);
}
