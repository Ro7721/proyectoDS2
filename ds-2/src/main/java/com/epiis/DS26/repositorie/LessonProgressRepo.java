package com.epiis.DS26.repositorie;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import com.epiis.DS26.entity.EntityLessonProgress;

public interface LessonProgressRepo extends JpaRepository<EntityLessonProgress, String> {
    // Busca el progreso de una lección puntual dentro de una inscripción
    Optional<EntityLessonProgress> findByEnrollment_IdEnrollmentAndLesson_IdLesson(String idEnrollment,
            String idLesson);

    // Cuenta cuántas lecciones completó el estudiante dentro de una inscripción
    long countByEnrollment_IdEnrollmentAndIsCompletedTrue(String idEnrollment);

    List<EntityLessonProgress> findByEnrollment_IdEnrollment(String idEnrollment);
}
