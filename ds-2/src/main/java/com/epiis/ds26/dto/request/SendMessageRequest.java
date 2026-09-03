package com.epiis.ds26.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SendMessageRequest {
    @NotBlank(message = "El ID de la conversación es obligatorio")
    @Size(min = 36, max = 36, message = "El ID de la conversación debe tener 36 caracteres")
    private String conversationId;

    @NotBlank(message = "El mensaje es obligatorio")
    @Size(max = 5000, message = "El mensaje debe tener máximo 5000 caracteres")
    private String content;

    @Size(max = 255, message = "La URL del adjunto debe tener máximo 255 caracteres")
    private String attachmentUrl;
}
