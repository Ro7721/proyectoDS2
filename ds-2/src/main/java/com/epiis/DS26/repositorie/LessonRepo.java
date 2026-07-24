package com.epiis.DS26.repositorie;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.epiis.DS26.entity.EntityLesson;

public interface LessonRepo extends JpaRepository<EntityLesson, String> {
        boolean existsByCourse_IdCourseAndLessonOrder(String courseId, Integer lessonOrder);

        long countByCourse_IdCourse(String courseId);

        @Query("SELECT COALESCE(MAX(l.lessonOrder), 0) FROM EntityLesson l WHERE l.course.idCourse = :courseId")
        Integer findMaxLessonOrderByCourseId(@Param("courseId") String courseId);

        @Query("""
                            SELECT l
                            FROM EntityLesson l
                            WHERE l.course.idCourse = :courseId
                        """)
        List<EntityLesson> findByCourseId(String courseId);

        // Obtener lecciones por profesor ordenado por curso y lección
        List<EntityLesson> findByCourse_Teacher_IdUserOrderByCourse_TitleAscLessonOrderAsc(String teacherId);

        // Obtener lecciones por curso y profesor
        List<EntityLesson> findByCourse_IdCourseAndCourse_Teacher_IdUser(String courseId, String teacherId);

        @Query("""
                        SELECT l FROM EntityLesson l
                        WHERE (:title IS NULL OR LOWER(l.title) LIKE LOWER(CONCAT('%', :title, '%')))
                        AND (:courseId IS NULL OR l.course.idCourse = :courseId)
                        ORDER BY l.lessonOrder ASC
                        """)
        List<EntityLesson> searchLessons(@Param("title") String title,
                        @Param("courseId") String courseId);
}
