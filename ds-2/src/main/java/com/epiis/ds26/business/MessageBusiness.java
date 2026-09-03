package com.epiis.ds26.business;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.UUID;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import com.epiis.ds26.dto.request.SendMessageRequest;
import com.epiis.ds26.dto.response.MessageResponse;
import com.epiis.ds26.dto.response.ReadReceiptNotification;
import com.epiis.ds26.entity.EntityConversation;
import com.epiis.ds26.entity.EntityConversationParticipant;
import com.epiis.ds26.entity.EntityMessage;
import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.enums.MessageStatus;
import com.epiis.ds26.message.GenericResponse;
import com.epiis.ds26.repositorie.ConversationParticipantRepo;
import com.epiis.ds26.repositorie.ConversationRepo;
import com.epiis.ds26.repositorie.MessageRepo;

import jakarta.transaction.Transactional;

@Service
public class MessageBusiness {
    private final MessageRepo messageRepo;
    private final ConversationRepo conversationRepo;
    private final ConversationParticipantRepo participantRepo;
    private final AuthenticationBusiness authBusiness;
    private final SimpMessagingTemplate messagingTemplate;

    private final ZoneId zoneId = ZoneId.of("America/Lima");

    public MessageBusiness(
            MessageRepo messageRepo,
            ConversationRepo conversationRepo,
            ConversationParticipantRepo participantRepo,
            AuthenticationBusiness authBusiness,
            SimpMessagingTemplate messagingTemplate) {
        this.messageRepo = messageRepo;
        this.conversationRepo = conversationRepo;
        this.participantRepo = participantRepo;
        this.authBusiness = authBusiness;
        this.messagingTemplate = messagingTemplate;
    }

    @Transactional
    public MessageResponse sendMessage(SendMessageRequest request, GenericResponse response) {
        EntityUser currentUser = authBusiness.getCurrentUser();

        if (request.getContent() == null || request.getContent().trim().isEmpty()) {
            response.warning();
            response.listMessage.add("El contenido del mensaje no puede estar vacío");
            return null;
        }

        EntityConversation conversation = conversationRepo.findById(request.getConversationId()).orElse(null);
        if (conversation == null) {
            response.warning();
            response.listMessage.add("Conversación no encontrada");
            return null;
        }

        LocalDateTime now = LocalDateTime.now(zoneId);

        // 1. Guardar el mensaje
        EntityMessage message = new EntityMessage();
        message.setIdMessage(UUID.randomUUID().toString());
        message.setConversation(conversation);
        message.setSender(currentUser);
        message.setContent(request.getContent().trim());
        message.setAttachmentUrl(request.getAttachmentUrl());
        message.setStatus(MessageStatus.SENT);
        message.setSentAt(now);

        EntityMessage savedMessage = messageRepo.save(message);

        // 2. Actualizar fecha de la conversación e incrementar no leídos
        conversation.setUpdatedAt(now);
        conversationRepo.save(conversation);
        participantRepo.incrementUnreadCountForRecipients(conversation.getIdConversation(), currentUser.getIdUser());

        // 3. Emitir mensaje personalizado a cada participante con isMine correcto.
        List<EntityConversationParticipant> participants =
                participantRepo.findByConversation_IdConversation(conversation.getIdConversation());

        for (EntityConversationParticipant participant : participants) {
            String participantUserId = participant.getUser().getIdUser();
            MessageResponse participantDto = mapToMessageResponse(savedMessage, participantUserId);
            messagingTemplate.convertAndSendToUser(
                    participantUserId,
                    "/queue/messages",
                    participantDto);
        }

        MessageResponse responseDto = mapToMessageResponse(savedMessage, currentUser.getIdUser());

        response.success();
        response.listMessage.add("Mensaje enviado exitosamente");
        return responseDto;
    }

    public List<MessageResponse> getMessagesByConversation(String conversationId, GenericResponse response) {
        EntityUser currentUser = authBusiness.getCurrentUser();

        if (!participantRepo.existsByConversation_IdConversationAndUser_IdUser(conversationId,
                currentUser.getIdUser())) {
            response.error();
            response.listMessage.add("No perteneces a esta conversación");
            return List.of();
        }

        List<EntityMessage> messages = messageRepo.findByConversation_IdConversationOrderBySentAtAsc(conversationId);
        response.success();
        response.listMessage.add("Mensajes obtenidos exitosamente");

        return messages.stream()
                .map(m -> mapToMessageResponse(m, currentUser.getIdUser()))
                .toList();
    }

    @Transactional
    public boolean markAsRead(String conversationId, GenericResponse response) {
        EntityUser currentUser = authBusiness.getCurrentUser();
        LocalDateTime now = LocalDateTime.now(zoneId);

        participantRepo.resetUnreadCountAndMarkAsRead(conversationId, currentUser.getIdUser(), now);
        messageRepo.markMessagesAsReadForUser(conversationId, currentUser.getIdUser(), MessageStatus.READ);

        // Notificar por WebSocket al otro usuario que sus mensajes fueron leídos
        ReadReceiptNotification notification = new ReadReceiptNotification(conversationId, currentUser.getIdUser(),
                now);
        messagingTemplate.convertAndSend("/topic/conversation/" + conversationId + "/read", notification);

        response.success();
        response.listMessage.add("Mensajes marcados como leídos");
        return true;
    }

    private MessageResponse mapToMessageResponse(EntityMessage entity, String currentUserId) {
        MessageResponse r = new MessageResponse();
        r.setIdMessage(entity.getIdMessage());
        r.setIdConversation(entity.getConversation().getIdConversation());
        r.setSenderId(entity.getSender().getIdUser());
        r.setSenderName(entity.getSender().getFirstName() + " " + entity.getSender().getLastName());
        r.setContent(entity.getContent());
        r.setAttachmentUrl(entity.getAttachmentUrl());
        r.setStatus(entity.getStatus());
        r.setSentAt(entity.getSentAt());
        r.setIsMine(entity.getSender().getIdUser().equals(currentUserId));
        return r;
    }
}
