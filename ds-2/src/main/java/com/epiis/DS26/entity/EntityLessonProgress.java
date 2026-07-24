package com.epiis.DS26.entity;

import java.sql.Timestamp;

import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.Data;
import lombok.Getter;
import lombok.Setter;

@Data
@Entity
@Table(name = "tlesson_progress")
@Getter
@Setter
public class EntityLessonProgress {
    @Id
    private String idProgress;
    @ManyToOne
    @JoinColumn(name = "enrollmentId")
    private EntityEnrollment enrollment;
    @ManyToOne
    @JoinColumn(name = "lessonId")
    private EntityLesson lesson;
    private boolean isCompleted;
    private int watchedPercentage;
    private int lastPositionSeconds;
    private Timestamp completedAt;
}
