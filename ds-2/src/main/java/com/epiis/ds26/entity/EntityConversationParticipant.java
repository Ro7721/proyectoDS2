package com.epiis.ds26.entity;

import java.time.LocalDateTime;

import org.hibernate.annotations.CreationTimestamp;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import jakarta.persistence.UniqueConstraint;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "tconversation_participant", uniqueConstraints = {
        @UniqueConstraint(name = "uqConversationUser", columnNames = { "idConversation", "idUser" })
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class EntityConversationParticipant {
    @Id
    @Column(name = "idParticipant", nullable = false, length = 36, updatable = false)
    private String idParticipant;
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idConversation", nullable = false)
    private EntityConversation conversation;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "idUser", nullable = false)
    private EntityUser user;

    @Column(name = "unreadCount", nullable = false)
    @Builder.Default
    private Integer unreadCount = 0;

    @CreationTimestamp
    @Column(name = "joinedAt", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "lastReadAt")
    private LocalDateTime lastReadAt;
}
