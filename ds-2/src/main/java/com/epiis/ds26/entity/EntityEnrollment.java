package com.epiis.ds26.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
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
@Table(name = "tenrollment") // Inscripcion
@Getter
@Setter
public class EntityEnrollment {
    @Id
    private String idEnrollment;
    @ManyToOne
    @JoinColumn(name = "studentId")
    private EntityUser student;
    @ManyToOne
    @JoinColumn(name = "courseId")
    private EntityCourse course;
    private LocalDateTime enrollmentDate;
    private LocalDateTime lastAccess;
    private Integer totalProgress;
    private boolean isCompleted;

    @OneToMany(mappedBy = "enrollment", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EntityLessonProgress> lessonProgress = new ArrayList<>();
}
