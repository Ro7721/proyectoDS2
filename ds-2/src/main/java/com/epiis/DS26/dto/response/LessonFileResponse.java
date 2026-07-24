package com.epiis.DS26.dto.response;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class LessonFileResponse {
    private String idFile;
    private String fileName;
    private String fileUrl;
    private String fileType;
    private Integer fileOrder;
}
