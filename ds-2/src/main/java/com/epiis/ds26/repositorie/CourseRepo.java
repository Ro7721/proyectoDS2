package com.epiis.ds26.repositorie;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import com.epiis.ds26.entity.EntityCategory;
import com.epiis.ds26.entity.EntityCourse;
import com.epiis.ds26.entity.EntityUser;

public interface CourseRepo extends JpaRepository<EntityCourse, String> {
    // filtrar cursos por categoria
    List<EntityCourse> findByCategoryName(EntityCategory category);

    // filtrar cursos por docente
    List<EntityCourse> findByTeacher(EntityUser teacher);

    @Query("""
                SELECT c
                FROM EntityCourse c
                WHERE c.teacher.idUser = :teacher
            """)
    List<EntityCourse> findByTeacherId(String teacher);

    @Query("""
                SELECT c FROM EntityCourse c
                JOIN FETCH c.category ct
                JOIN FETCH c.teacher t
                WHERE c.status = 'PUBLISHED'
                ORDER BY c.title ASC
            """)
    List<EntityCourse> findAllPublishedCourses();

    @Query("""
                SELECT c
                FROM EntityCourse c
                JOIN FETCH c.category cat
                WHERE c.status = 'PUBLISHED'
            """)
    List<EntityCourse> findAllPublishedCoursesForSearch();
}
