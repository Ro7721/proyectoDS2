package com.epiis.ds26.repositorie;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.epiis.ds26.entity.EntityLessonFile;

public interface LessonFileRepo extends JpaRepository<EntityLessonFile, String> {
    List<EntityLessonFile> findByLesson_IdLessonOrderByFileOrderAsc(String lessonId);

    long countByLesson_IdLesson(String lessonId);

    @Query("""
                SELECT f
                FROM EntityLessonFile f
                WHERE f.lesson.idLesson = :lessonId
            """)
    List<EntityLessonFile> findByLessonId(String lessonId);
}
