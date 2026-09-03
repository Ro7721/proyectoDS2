package com.epiis.ds26.dto.request;

import com.epiis.ds26.enums.ConversationType;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateConversationRequest {
    @NotBlank(message = "El ID del destinatario es obligatorio")
    @Size(min = 36, max = 36, message = "El ID del destinatario debe tener 36 caracteres")
    private String recipientId;
    @Size(min = 36, max = 36, message = "El ID del curso debe tener 36 caracteres")
    private String courseId; // opcional, puede ser null en chats directos
    @NotNull(message = "El tipo de conversacion es necesario")
    private ConversationType type;
}
