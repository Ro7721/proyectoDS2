package com.epiis.ds26.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.epiis.ds26.enums.ELevel;
import com.epiis.ds26.enums.EStatus;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.OneToMany;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Entity
@Table(name = "tcourse")
@Getter
@Setter
public class EntityCourse {
    @Id
    @Column(name = "idCourse")
    private String idCourse;
    @Column(name = "title")
    private String title;
    @Column(name = "description")
    private String description;
    @Column(name = "coverImage")
    private String coverImage;
    @Enumerated(EnumType.STRING)
    @Column(name = "level")
    private ELevel level;
    @Column(name = "price")
    private double price;
    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private EStatus status;
    @ManyToOne
    @JoinColumn(name = "teacherId")
    private EntityUser teacher;
    @ManyToOne
    @JoinColumn(name = "categoryId")
    private EntityCategory category;
    @Column(name = "createdAt")
    private LocalDateTime createdAt;
    @Column(name = "updatedAt")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EntityLesson> lessons = new ArrayList<>();

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EntityEnrollment> enrollments = new ArrayList<>();
}
