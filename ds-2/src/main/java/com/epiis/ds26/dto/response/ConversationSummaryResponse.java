package com.epiis.ds26.dto.response;

import java.time.LocalDateTime;

import com.epiis.ds26.enums.ConversationType;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
public class ConversationSummaryResponse {
    private String conversationId;
    private ConversationType type;
    private String courseId;
    private String courseTitle;
    private ParticipantSummaryResponse recipient;
    private String lastMessageContent;
    private LocalDateTime lastMessageSentAt;
    private Integer unreadCount;
    private LocalDateTime updatedAt;
}
