package com.epiis.ds26.dto.response;

import java.time.LocalDateTime;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReadReceiptNotification {
    private String conversationId;
    private String readerId;
    private LocalDateTime readAt;
}
