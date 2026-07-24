package com.epiis.DS26.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CourseProgressResponse {
    private String idLesson;
    private boolean lessonCompleted;
    private int watchedPercentage;
    private int lastPositionSeconds;
    // Progreso agregado del curso completo (recalculado en cada guardado)
    private Integer totalProgress;
    private boolean courseCompleted;
}
