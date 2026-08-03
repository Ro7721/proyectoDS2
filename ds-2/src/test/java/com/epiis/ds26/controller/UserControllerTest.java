package com.epiis.ds26.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.when;

import java.util.Collections;
import java.util.List;
import java.util.Map;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.epiis.ds26.business.UserBusiness;
import com.epiis.ds26.dto.request.UserRequest;
import com.epiis.ds26.dto.response.UserResponse;
import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.enums.ERole;
import com.epiis.ds26.message.ApiResponse;
import com.epiis.ds26.message.GenericResponse;

@ExtendWith(MockitoExtension.class)
class UserControllerTest {

    @Mock
    private UserBusiness userBusiness;

    @InjectMocks
    private UserController userController;

    private UserRequest sampleRequest;
    private EntityUser sampleUser;
    private UserResponse sampleResponse;

    @BeforeEach
    void setUp() {
        sampleRequest = new UserRequest();
        sampleUser = new EntityUser();
        sampleResponse = new UserResponse();
    }

    @Test
    void createUser_success() {
        when(userBusiness.insert(eq(sampleRequest), any(GenericResponse.class))).thenReturn(sampleUser);
        when(userBusiness.convertToResponse(sampleUser)).thenReturn(sampleResponse);

        ResponseEntity<ApiResponse<UserResponse>> response = userController.createUser(sampleRequest);

        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());
        assertEquals(sampleResponse, response.getBody().getData());
    }

    @Test
    void createUser_failure() {
        when(userBusiness.insert(eq(sampleRequest), any(GenericResponse.class))).thenReturn(null);

        ResponseEntity<ApiResponse<UserResponse>> response = userController.createUser(sampleRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getAllUsers_success() {
        when(userBusiness.list()).thenReturn(Collections.singletonList(sampleResponse));

        ResponseEntity<List<UserResponse>> response = userController.getAllUsers();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().size());
    }

    @Test
    void getUserById_found() {
        when(userBusiness.list("user-123")).thenReturn(Collections.singletonList(sampleResponse));

        ResponseEntity<UserResponse> response = userController.getUserById("user-123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(sampleResponse, response.getBody());
    }

    @Test
    void getUserById_notFound() {
        when(userBusiness.list("user-123")).thenReturn(Collections.emptyList());

        ResponseEntity<UserResponse> response = userController.getUserById("user-123");

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void deleteUser_success() {
        when(userBusiness.delete(eq("user-123"), any(GenericResponse.class))).thenReturn(true);

        ResponseEntity<ApiResponse<Boolean>> response = userController.deleteUser("user-123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(true, response.getBody().getData());
    }

    @Test
    void deleteUser_failure() {
        when(userBusiness.delete(eq("user-123"), any(GenericResponse.class))).thenReturn(false);

        ResponseEntity<ApiResponse<Boolean>> response = userController.deleteUser("user-123");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void updateUser_success() {
        when(userBusiness.list("user-123")).thenReturn(Collections.singletonList(sampleResponse));

        ResponseEntity<ApiResponse<UserResponse>> response = userController.updateUser("user-123", sampleRequest);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(sampleResponse, response.getBody().getData());
    }

    @Test
    void updateUser_failure() {
        when(userBusiness.list("user-123")).thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<UserResponse>> response = userController.updateUser("user-123", sampleRequest);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void searchUsers_success() {
        when(userBusiness.searchUsers(any(), any(), any(), any(GenericResponse.class)))
                .thenReturn(Collections.singletonList(sampleResponse));

        ResponseEntity<ApiResponse<List<UserResponse>>> response = userController.searchUsers("name", "email", "role");

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(1, response.getBody().getData().size());
    }

    @Test
    void searchUsers_failure() {
        when(userBusiness.searchUsers(any(), any(), any(), any(GenericResponse.class)))
                .thenReturn(Collections.emptyList());

        ResponseEntity<ApiResponse<List<UserResponse>>> response = userController.searchUsers("name", "email", "role");

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getCurrentUser_success() {
        when(userBusiness.getCurrentUser(any(GenericResponse.class)))
                .thenReturn(Collections.singletonList(sampleResponse));

        ResponseEntity<ApiResponse<UserResponse>> response = userController.getCurrentUser();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(sampleResponse, response.getBody().getData());
    }

    @Test
    void activateUser_success() {
        when(userBusiness.activateUser(eq("user-123"), any(GenericResponse.class))).thenReturn(true);

        ResponseEntity<ApiResponse<Boolean>> response = userController.activateUser("user-123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void deactivateUser_success() {
        when(userBusiness.deactivateUser(eq("user-123"), any(GenericResponse.class))).thenReturn(true);

        ResponseEntity<ApiResponse<Boolean>> response = userController.deactivateUser("user-123");

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void changeRole_success() {
        when(userBusiness.changeRole(eq("user-123"), eq(ERole.ROLE_ADMIN), any(GenericResponse.class)))
                .thenReturn(true);

        ResponseEntity<ApiResponse<Boolean>> response = userController.changeRole("user-123", Map.of("role", "ROLE_ADMIN"));

        assertEquals(HttpStatus.OK, response.getStatusCode());
    }

    @Test
    void changeRole_invalidRole() {
        ResponseEntity<ApiResponse<Boolean>> response = userController.changeRole("user-123", Map.of("role", "INVALID_ROLE"));

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }
}
