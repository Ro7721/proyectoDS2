package com.epiis.ds26.dto.response;

import java.time.LocalDateTime;

import com.epiis.ds26.enums.MessageStatus;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MessageResponse {
    private String idMessage;
    private String idConversation;
    private String senderId;
    private String senderName; // Nombre completo (firstName + lastName)
    private String content;
    private String attachmentUrl; // opcional, si se envía archivo
    private MessageStatus status; // SENT, DELIVERED, READ
    private LocalDateTime sentAt;
    private Boolean isMine;// Facilita la alineación en la UI de Angular (derecha/izquierda)
}
