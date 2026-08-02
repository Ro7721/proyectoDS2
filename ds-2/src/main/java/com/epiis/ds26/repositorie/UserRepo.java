package com.epiis.ds26.repositorie;

import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.epiis.ds26.entity.EntityUser;

public interface UserRepo extends JpaRepository<EntityUser, String> {
       Optional<EntityUser> findByEmailAndIsActiveTrue(String email);

       boolean existsByEmail(String email);

       @Query("""
                     SELECT u FROM EntityUser u
                     WHERE (:name IS NULL OR LOWER(u.firstName) LIKE LOWER(CONCAT('%', :name, '%'))
                            OR LOWER(u.lastName) LIKE LOWER(CONCAT('%', :name, '%')))
                     AND (:email IS NULL OR LOWER(u.email) LIKE LOWER(CONCAT('%', :email, '%')))
                     AND (:role IS NULL OR u.role = :role)
                     """)
       List<EntityUser> searchUsers(@Param("name") String name,
                     @Param("email") String email,
                     @Param("role") com.epiis.ds26.enums.ERole role);

       // listar usuarios por id y por su estado sea activo
       Optional<EntityUser> findByIsActiveTrueAndIdUser(String idUser);
}
