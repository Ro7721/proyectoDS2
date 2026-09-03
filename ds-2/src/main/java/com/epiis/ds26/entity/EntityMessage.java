package com.epiis.ds26.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import com.epiis.ds26.enums.MessageStatus;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.Index;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tmessage", indexes = {
        @Index(name = "idx_conv_sent_at", columnList = "idConversation, sentAt")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityMessage {
    @Id
    @Column(name = "idMessage", length = 36, nullable = false, updatable = false)
    private String idMessage;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idConversation", nullable = false)
    private EntityConversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "senderId", nullable = false)
    private EntityUser sender;

    @Lob
    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "attachmentUrl", length = 255)
    private String attachmentUrl;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 20)
    @Builder.Default
    private MessageStatus status = MessageStatus.SENT;

    @CreationTimestamp
    @Column(name = "sentAt", nullable = false, updatable = false)
    private LocalDateTime sentAt;
}
