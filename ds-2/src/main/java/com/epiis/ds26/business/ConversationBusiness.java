package com.epiis.ds26.business;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.epiis.ds26.dto.request.CreateConversationRequest;
import com.epiis.ds26.dto.response.ConversationSummaryResponse;
import com.epiis.ds26.dto.response.ParticipantSummaryResponse;
import com.epiis.ds26.entity.EntityConversation;
import com.epiis.ds26.entity.EntityConversationParticipant;
import com.epiis.ds26.entity.EntityCourse;
import com.epiis.ds26.entity.EntityMessage;
import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.enums.ConversationType;
import com.epiis.ds26.message.GenericResponse;
import com.epiis.ds26.repositorie.ConversationParticipantRepo;
import com.epiis.ds26.repositorie.ConversationRepo;
import com.epiis.ds26.repositorie.CourseRepo;
import com.epiis.ds26.repositorie.MessageRepo;
import com.epiis.ds26.repositorie.UserRepo;

import jakarta.transaction.Transactional;

@Service
public class ConversationBusiness {
    private final ConversationRepo conversationRepo;
    private final ConversationParticipantRepo participantRepo;
    private final MessageRepo messageRepo;
    private final UserRepo userRepo;
    private final CourseRepo courseRepo;
    private final AuthenticationBusiness authBusiness;

    private final ZoneId zoneId = ZoneId.of("America/Lima");

    public ConversationBusiness(
            ConversationRepo conversationRepo,
            ConversationParticipantRepo participantRepo,
            MessageRepo messageRepo,
            UserRepo userRepo,
            CourseRepo courseRepo,
            AuthenticationBusiness authBusiness) {
        this.conversationRepo = conversationRepo;
        this.participantRepo = participantRepo;
        this.messageRepo = messageRepo;
        this.userRepo = userRepo;
        this.courseRepo = courseRepo;
        this.authBusiness = authBusiness;
    }

    @Transactional
    public ConversationSummaryResponse getOrCreateConversation(CreateConversationRequest request,
            GenericResponse response) {
        EntityUser currentUser = authBusiness.getCurrentUser();

        if (request.getRecipientId() == null || request.getRecipientId().trim().isEmpty()) {
            response.warning();
            response.listMessage.add("El ID del destinatario es obligatorio");
            return null;
        }

        if (currentUser.getIdUser().equals(request.getRecipientId())) {
            response.warning();
            response.listMessage.add("No puedes crear una conversación contigo mismo");
            return null;
        }

        EntityUser recipient = userRepo.findById(request.getRecipientId()).orElse(null);
        if (recipient == null) {
            response.warning();
            response.listMessage.add("Destinatario no encontrado");
            return null;
        }

        // 1. Buscar si ya existe la conversación entre ambos
        Optional<EntityConversation> existingConv = conversationRepo.findDirectConversation(
                currentUser.getIdUser(), recipient.getIdUser(), request.getCourseId());

        if (existingConv.isPresent()) {
            response.success();
            response.listMessage.add("Conversación recuperada");
            return mapToSummaryResponse(existingConv.get(), currentUser.getIdUser());
        }

        // 2. Crear nueva conversación
        EntityConversation newConversation = new EntityConversation();
        newConversation.setIdConversation(UUID.randomUUID().toString());
        newConversation.setType(request.getType() != null ? request.getType() : ConversationType.DIRECT);
        newConversation.setCreatedAt(LocalDateTime.now(zoneId));
        newConversation.setUpdatedAt(newConversation.getCreatedAt());

        if (request.getCourseId() != null && !request.getCourseId().trim().isEmpty()) {
            EntityCourse course = courseRepo.findById(request.getCourseId()).orElse(null);
            newConversation.setCourse(course);
        }

        EntityConversation savedConv = conversationRepo.save(newConversation);

        // 3. Registrar participantes
        EntityConversationParticipant senderPart = new EntityConversationParticipant();
        senderPart.setIdParticipant(UUID.randomUUID().toString());
        senderPart.setConversation(savedConv);
        senderPart.setUser(currentUser);
        senderPart.setUnreadCount(0);
        senderPart.setJoinedAt(LocalDateTime.now(zoneId));
        senderPart.setLastReadAt(LocalDateTime.now(zoneId));

        EntityConversationParticipant recipientPart = new EntityConversationParticipant();
        recipientPart.setIdParticipant(UUID.randomUUID().toString());
        recipientPart.setConversation(savedConv);
        recipientPart.setUser(recipient);
        recipientPart.setUnreadCount(0);
        recipientPart.setJoinedAt(LocalDateTime.now(zoneId));

        participantRepo.saveAll(List.of(senderPart, recipientPart));

        response.success();
        response.listMessage.add("Conversación creada exitosamente");
        return mapToSummaryResponse(savedConv, currentUser.getIdUser());
    }

    public List<ConversationSummaryResponse> getMyConversations(GenericResponse response) {
        EntityUser currentUser = authBusiness.getCurrentUser();
        List<EntityConversation> conversations = conversationRepo.findAllByUserId(currentUser.getIdUser());

        response.success();
        response.listMessage.add("Conversaciones obtenidas exitosamente");
        return conversations.stream()
                .map(c -> mapToSummaryResponse(c, currentUser.getIdUser()))
                .toList();
    }

    public ConversationSummaryResponse mapToSummaryResponse(EntityConversation entity, String currentUserId) {
        ConversationSummaryResponse r = new ConversationSummaryResponse();
        r.setConversationId(entity.getIdConversation());
        r.setType(entity.getType());
        r.setUpdatedAt(entity.getUpdatedAt());

        if (entity.getCourse() != null) {
            r.setCourseId(entity.getCourse().getIdCourse());
            r.setCourseTitle(entity.getCourse().getTitle());
        }

        // Buscar al destinatario (el otro participante)
        entity.getParticipants().stream()
                .filter(p -> !p.getUser().getIdUser().equals(currentUserId))
                .findFirst()
                .ifPresent(p -> {
                    ParticipantSummaryResponse recipientDto = new ParticipantSummaryResponse();
                    recipientDto.setIdUser(p.getUser().getIdUser());
                    recipientDto.setFirstName(p.getUser().getFirstName());
                    recipientDto.setSurName(p.getUser().getLastName());
                    recipientDto.setEmail(p.getUser().getEmail());
                    recipientDto.setRole(p.getUser().getRole());
                    recipientDto.setLastReadAt(p.getLastReadAt());
                    r.setRecipient(recipientDto);
                });

        // Cantidad de no leídos para el usuario actual
        entity.getParticipants().stream()
                .filter(p -> p.getUser().getIdUser().equals(currentUserId))
                .findFirst()
                .ifPresent(p -> r.setUnreadCount(p.getUnreadCount()));

        // Último mensaje
        Optional<EntityMessage> lastMsg = messageRepo
                .findFirstByConversation_IdConversationOrderBySentAtDesc(entity.getIdConversation());
        if (lastMsg.isPresent()) {
            r.setLastMessageContent(lastMsg.get().getContent());
            r.setLastMessageSentAt(lastMsg.get().getSentAt());
        }

        return r;
    }
}
