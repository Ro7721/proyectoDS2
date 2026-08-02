package com.epiis.ds26.dto.response;

import java.time.LocalDateTime;
import java.util.List;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LessonResponse {
    private String idLesson;
    private String courseId;
    private String title;
    private String description;
    private String type;
    private String contentUrl;
    private Integer durationMinutes;
    private Integer lessonOrder;
    private Boolean isFree;
    private LocalDateTime createdAt;
    private List<LessonFileResponse> files;
}
