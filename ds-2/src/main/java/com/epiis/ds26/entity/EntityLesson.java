package com.epiis.ds26.entity;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import com.epiis.ds26.enums.EType;

import jakarta.persistence.CascadeType;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
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
@Table(name = "tlesson")
@Getter
@Setter
public class EntityLesson {
    @Id
    private String idLesson;
    @ManyToOne
    @JoinColumn(name = "courseId")
    private EntityCourse course;
    private String title;
    private String description;
    @Enumerated(EnumType.STRING)
    private EType type;
    private String contentUrl;
    private Integer durationMinutes;
    private Integer lessonOrder;
    private Boolean isFree;
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<EntityLessonFile> files = new ArrayList<>();

    @OneToMany(mappedBy = "lesson", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<EntityLessonProgress> progressList = new ArrayList<>();
}
