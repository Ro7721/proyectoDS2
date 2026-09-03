package com.epiis.ds26.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.ds26.business.ConversationBusiness;
import com.epiis.ds26.business.MessageBusiness;
import com.epiis.ds26.dto.request.CreateConversationRequest;
import com.epiis.ds26.dto.request.SendMessageRequest;
import com.epiis.ds26.dto.response.ConversationSummaryResponse;
import com.epiis.ds26.dto.response.MessageResponse;
import com.epiis.ds26.message.ApiResponse;
import com.epiis.ds26.message.GenericResponse;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "messages", produces = MediaType.APPLICATION_JSON_VALUE)
public class MessageController {
    private final MessageBusiness messageBusiness;
    private final ConversationBusiness conversationBusiness;

    public MessageController(MessageBusiness messageBusiness, ConversationBusiness conversationBusiness) {
        this.messageBusiness = messageBusiness;
        this.conversationBusiness = conversationBusiness;
    }

    /**
     * Creates a direct conversation or returns the existing one for the same
     * participants and course.
     */
    @PostMapping(path = "conversations", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<ConversationSummaryResponse>> getOrCreateConversation(
            @Valid @RequestBody CreateConversationRequest request) {
        GenericResponse response = new GenericResponse();
        ConversationSummaryResponse conversation = conversationBusiness.getOrCreateConversation(request, response);

        return buildResponse(conversation, response, HttpStatus.CREATED);
    }

    @GetMapping(path = "conversations")
    public ResponseEntity<ApiResponse<List<ConversationSummaryResponse>>> getMyConversations() {
        GenericResponse response = new GenericResponse();
        List<ConversationSummaryResponse> conversations = conversationBusiness.getMyConversations(response);

        return ResponseEntity.ok(new ApiResponse<>(response, conversations));
    }

    @PostMapping(consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<ApiResponse<MessageResponse>> sendMessage(
            @Valid @RequestBody SendMessageRequest request) {
        GenericResponse response = new GenericResponse();
        MessageResponse message = messageBusiness.sendMessage(request, response);

        return buildResponse(message, response, HttpStatus.CREATED);
    }

    @GetMapping(path = "conversations/{conversationId}")
    public ResponseEntity<ApiResponse<List<MessageResponse>>> getMessagesByConversation(
            @PathVariable String conversationId) {
        GenericResponse response = new GenericResponse();
        List<MessageResponse> messages = messageBusiness.getMessagesByConversation(conversationId, response);

        if (!"success".equals(response.getType())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(new ApiResponse<>(response, messages));
        }
        return ResponseEntity.ok(new ApiResponse<>(response, messages));
    }

    @PutMapping(path = "conversations/{conversationId}/read")
    public ResponseEntity<ApiResponse<Boolean>> markConversationAsRead(@PathVariable String conversationId) {
        GenericResponse response = new GenericResponse();
        boolean markedAsRead = messageBusiness.markAsRead(conversationId, response);

        return buildResponse(markedAsRead, response, HttpStatus.OK);
    }

    private <T> ResponseEntity<ApiResponse<T>> buildResponse(T data, GenericResponse response, HttpStatus successStatus) {
        ApiResponse<T> apiResponse = new ApiResponse<>(response, data);
        if (data == null || !"success".equals(response.getType())) {
            return ResponseEntity.badRequest().body(apiResponse);
        }
        return ResponseEntity.status(successStatus).body(apiResponse);
    }

}
