package com.epiis.DS26.controller;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.epiis.DS26.business.UserBusiness;
import com.epiis.DS26.dto.request.UserRequest;
import com.epiis.DS26.dto.response.UserResponse;
import com.epiis.DS26.entity.EntityUser;
import com.epiis.DS26.enums.ERole;
import com.epiis.DS26.message.ApiResponse;
import com.epiis.DS26.message.GenericResponse;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping(path = "users")
public class UserController {

    private final UserBusiness userBusiness;

    public UserController(UserBusiness userBusiness) {
        this.userBusiness = userBusiness;
    }

    @PostMapping(path = "create", consumes = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<UserResponse>> createUser(@RequestBody UserRequest request) {
        GenericResponse response = new GenericResponse();
        EntityUser user = userBusiness.insert(request, response);
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        if (user != null) {
            apiResponse.setData(userBusiness.convertToResponse(user));
            return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @GetMapping(path = "list")
    public ResponseEntity<List<UserResponse>> getAllUsers() {
        List<UserResponse> users = userBusiness.list();
        return ResponseEntity.ok(users);
    }

    @GetMapping(path = "search/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable String id) {
        List<UserResponse> userList = userBusiness.list(id);
        if (!userList.isEmpty()) {
            return ResponseEntity.ok(userList.get(0));
        }
        return ResponseEntity.notFound().build();
    }

    @DeleteMapping(path = "delete/{idUser}")
    public ResponseEntity<ApiResponse<Boolean>> deleteUser(@PathVariable String idUser) {
        GenericResponse response = new GenericResponse();
        boolean deleted = userBusiness.delete(idUser, response);
        ApiResponse<Boolean> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        apiResponse.setData(deleted);
        if (deleted) {
            return ResponseEntity.ok(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @PutMapping(path = "update/{idUser}")
    public ResponseEntity<ApiResponse<UserResponse>> updateUser(@PathVariable String idUser,
            @RequestBody UserRequest request) {
        GenericResponse response = new GenericResponse();
        userBusiness.update(idUser, request, response);
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        List<UserResponse> userList = userBusiness.list(idUser);
        if (!userList.isEmpty()) {
            apiResponse.setData(userList.get(0));
            return ResponseEntity.ok(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @GetMapping(path = "search")
    public ResponseEntity<ApiResponse<List<UserResponse>>> searchUsers(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) String email,
            @RequestParam(required = false) String role) {

        GenericResponse response = new GenericResponse();
        List<UserResponse> users = userBusiness.searchUsers(name, email, role, response);

        ApiResponse<List<UserResponse>> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        apiResponse.setData(users);

        if (users == null || users.isEmpty()) {
            return ResponseEntity.badRequest().body(apiResponse);
        }
        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping(path = "current-user")
    public ResponseEntity<ApiResponse<UserResponse>> getCurrentUser() {
        GenericResponse response = new GenericResponse();
        List<UserResponse> users = userBusiness.getCurrentUser(response);
        ApiResponse<UserResponse> apiResponse = new ApiResponse<>();
        if (users == null || users.isEmpty()) {
            apiResponse.setResponse(response);
            apiResponse.setData(null);
            return ResponseEntity.badRequest().body(apiResponse);
        }
        apiResponse.setResponse(response);
        apiResponse.setData(users.get(0));

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping(path = "activate/{idUser}")
    public ResponseEntity<ApiResponse<Boolean>> activateUser(@PathVariable String idUser) {
        GenericResponse response = new GenericResponse();
        boolean result = userBusiness.activateUser(idUser, response);
        ApiResponse<Boolean> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        apiResponse.setData(result);
        if (result) {
            return ResponseEntity.ok(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @PatchMapping(path = "deactivate/{idUser}")
    public ResponseEntity<ApiResponse<Boolean>> deactivateUser(@PathVariable String idUser) {
        GenericResponse response = new GenericResponse();
        boolean result = userBusiness.deactivateUser(idUser, response);
        ApiResponse<Boolean> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        apiResponse.setData(result);
        if (result) {
            return ResponseEntity.ok(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }

    @PatchMapping(path = "change-role/{idUser}")
    public ResponseEntity<ApiResponse<Boolean>> changeRole(
            @PathVariable String idUser,
            @RequestBody Map<String, String> body) {
        GenericResponse response = new GenericResponse();
        String roleStr = body.get("role");
        ERole newRole = null;
        try {
            newRole = ERole.valueOf(roleStr);
        } catch (Exception e) {
            response.warning();
            response.getListMessage().add("Rol inválido: " + roleStr);
            ApiResponse<Boolean> apiResponse = new ApiResponse<>();
            apiResponse.setResponse(response);
            apiResponse.setData(false);
            return ResponseEntity.badRequest().body(apiResponse);
        }
        boolean result = userBusiness.changeRole(idUser, newRole, response);
        ApiResponse<Boolean> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        apiResponse.setData(result);
        if (result) {
            return ResponseEntity.ok(apiResponse);
        }
        return ResponseEntity.badRequest().body(apiResponse);
    }
}
