package com.epiis.DS26.dto.response;

import java.sql.Timestamp;
import java.util.List;

import lombok.Data;

@Data
public class LessonContentResponse {
    private String idLesson;
    private String title;
    private String description;
    private String type;
    private Integer durationMinutes;
    private Integer lessonOrder;
    private boolean isFree;
    private String contentUrl;
    private List<LessonFileResponse> files;
    // NUEVO

    private Integer watchedPercentage;
    private Integer lastPositionSeconds;
    private Boolean completed;
    private Timestamp completedAt;
}
