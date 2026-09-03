package com.epiis.ds26.repositorie;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.epiis.ds26.entity.EntityMessage;
import com.epiis.ds26.enums.MessageStatus;

public interface MessageRepo extends JpaRepository<EntityMessage, String> {
    /**
     * Recupera todos los mensajes de una conversación en orden cronológico.
     */
    List<EntityMessage> findByConversation_IdConversationOrderBySentAtAsc(String idConversation);

    /**
     * Recupera el historial paginado de mensajes de una conversación.
     * Al consultar con orden descendente por fecha de envío, se obtienen primero
     * los mensajes más recientes (ideal para scroll infinito hacia arriba).
     */
    Page<EntityMessage> findByConversation_IdConversationOrderBySentAtDesc(
            String idConversation,
            Pageable pageable);

    /**
     * Obtiene el último mensaje enviado en una conversación para previsualizarlo
     * en la lista de chats de la bandeja de entrada.
     */
    Optional<EntityMessage> findFirstByConversation_IdConversationOrderBySentAtDesc(String idConversation);

    /**
     * Actualiza el estado a READ para todos los mensajes recibidos por el usuario
     * en la conversación que aún no hayan sido leídos.
     */
    @Modifying
    @Query("""
                UPDATE EntityMessage m
                SET m.status = :newStatus
                WHERE m.conversation.idConversation = :conversationId
                  AND m.sender.idUser <> :userId
                  AND m.status <> :newStatus
            """)
    void markMessagesAsReadForUser(
            @Param("conversationId") String conversationId,
            @Param("userId") String userId,
            @Param("newStatus") MessageStatus newStatus);
}
