package com.epiis.DS26.repositorie;

import java.util.List;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.epiis.DS26.entity.EntityCategory;

public interface CategoryRepo extends JpaRepository<EntityCategory, String> {

    @Query("""
            SELECT c FROM EntityCategory c
            WHERE (:name IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :name, '%')))
            """)
    List<EntityCategory> searchByName(@Param("name") String name);

    boolean existsByNameIgnoreCase(String name);
}
