package com.epiis.DS26.dto.request;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LessonProgressRequest {
    private String idLesson;
    private Integer watchedPercentage;
    private Integer lastPositionSeconds;
}
