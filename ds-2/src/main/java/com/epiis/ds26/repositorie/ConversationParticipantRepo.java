package com.epiis.ds26.repositorie;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.epiis.ds26.entity.EntityConversationParticipant;

public interface ConversationParticipantRepo extends JpaRepository<EntityConversationParticipant, String> {
    Optional<EntityConversationParticipant> findByConversation_IdConversationAndUser_IdUser(
            String idConversation,
            String idUser);

    List<EntityConversationParticipant> findByConversation_IdConversation(String idConversation);

    boolean existsByConversation_IdConversationAndUser_IdUser(String idConversation, String idUser);

    @Modifying
    @Query("""
                UPDATE EntityConversationParticipant cp
                SET cp.unreadCount = cp.unreadCount + 1
                WHERE cp.conversation.idConversation = :conversationId
                  AND cp.user.idUser <> :senderId
            """)
    void incrementUnreadCountForRecipients(
            @Param("conversationId") String conversationId,
            @Param("senderId") String senderId);

    @Modifying
    @Query("""
                UPDATE EntityConversationParticipant cp
                SET cp.unreadCount = 0,
                    cp.lastReadAt = :readTime
                WHERE cp.conversation.idConversation = :conversationId
                  AND cp.user.idUser = :userId
            """)
    void resetUnreadCountAndMarkAsRead(
            @Param("conversationId") String conversationId,
            @Param("userId") String userId,
            @Param("readTime") LocalDateTime readTime);
}
