package com.epiis.DS26.entity;

import java.time.LocalDateTime;
import java.util.List;

import com.epiis.DS26.enums.ERole;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Entity
@Table(name = "tuser")
@Getter
@Setter
public class EntityUser {
    @Id
    @Column(name = "idUser")
    private String idUser;
    @Column(name = "firstName")
    private String firstName;
    @Column(name = "lastName")
    private String lastName;
    @Column(name = "email")
    private String email;
    @Column(name = "password")
    private String password;
    @Enumerated(EnumType.STRING)
    @Column(name = "role")
    private ERole role;
    @Column(name = "isActive")
    private Boolean isActive;
    @Column(name = "createdAt")
    private LocalDateTime createdAt;
    @Column(name = "updatedAt")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "student")
    private List<EntityEnrollment> enrollments;
    @OneToMany(mappedBy = "teacher")
    private List<EntityCourse> courses;

}
