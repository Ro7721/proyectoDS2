package com.epiis.ds26.repositorie;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import com.epiis.ds26.entity.EntityConversation;

public interface ConversationRepo extends JpaRepository<EntityConversation, String> {
    /*
     * Busca una conversación existente entre dos usuarios específicos en base a su
     * ID.
     * Permite discriminar por curso (o chats sin curso asociado).
     */
    @Query("""
                SELECT c FROM EntityConversation c
                WHERE ( (:courseId IS NULL AND c.course IS NULL) OR (c.course.idCourse = :courseId) )
                  AND EXISTS (
                      SELECT cp1 FROM EntityConversationParticipant cp1
                      WHERE cp1.conversation = c AND cp1.user.idUser = :user1Id
                  )
                  AND EXISTS (
                      SELECT cp2 FROM EntityConversationParticipant cp2
                      WHERE cp2.conversation = c AND cp2.user.idUser = :user2Id
                  )
            """)
    Optional<EntityConversation> findDirectConversation(
            @Param("user1Id") String user1Id,
            @Param("user2Id") String user2Id,
            @Param("courseId") String courseId);

    /*
     * Obtiene el listado de conversaciones en las que participa el usuario,
     * ordenadas descendentemente por la fecha de última actualización.
     */
    @Query("""
                SELECT c FROM EntityConversation c
                JOIN c.participants cp
                WHERE cp.user.idUser = :userId
                ORDER BY c.updatedAt DESC
            """)
    Page<EntityConversation> findAllByUserIdOrderByUpdatedAtDesc(
            @Param("userId") String userId,
            Pageable pageable);

    @Query("""
                SELECT c FROM EntityConversation c
                JOIN c.participants cp
                WHERE cp.user.idUser = :userId
                ORDER BY c.updatedAt DESC
            """)
    List<EntityConversation> findAllByUserId(@Param("userId") String userId);
}
