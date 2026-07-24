package com.epiis.DS26.dto.request;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LessonRequest {
    private String courseId;
    private String title;
    private String description;
    private String type;
    private String contenUrl;
    private Integer durationMinutes;
    private Integer lessonOrder;
    private boolean isFree;
    private MultipartFile mainVideoFile; // Video principal de la lección
    private List<MultipartFile> adjunctFiles; // Archivos adicionales (PDFs, complementos, etc.)
}
