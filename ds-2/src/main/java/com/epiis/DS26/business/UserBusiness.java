package com.epiis.DS26.business;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.epiis.DS26.dto.request.UserRequest;
import com.epiis.DS26.dto.response.UserResponse;
import com.epiis.DS26.entity.EntityUser;
import com.epiis.DS26.enums.ERole;
import com.epiis.DS26.message.GenericResponse;
import com.epiis.DS26.repositorie.UserRepo;
import com.epiis.DS26.security.PasswordHasher;

import jakarta.transaction.Transactional;

@Service
public class UserBusiness {

    private final UserRepo userRepo;
    private final PasswordHasher passwordHasher;
    private final AuthenticationBusiness auth;

    public UserBusiness(UserRepo userRepo, PasswordHasher passwordHasher, AuthenticationBusiness auth) {
        this.userRepo = userRepo;
        this.passwordHasher = passwordHasher;
        this.auth = auth;
    }

    public EntityUser findByEmail(String email) {
        return userRepo.findByEmailAndIsActiveTrue(email).orElse(null);
    }

    public EntityUser insert(UserRequest request, GenericResponse response) {
        if (!validateUser(request, response)) {
            return null;
        }

        EntityUser entity = mapToEntity(request);
        response.success();
        response.getListMessage()
                .add("Usuario creado exitosamente");
        return userRepo.save(entity);
    }

    @Transactional
    public EntityUser mapToEntity(UserRequest request) {

        EntityUser entity = new EntityUser();

        entity.setIdUser(UUID.randomUUID().toString());
        entity.setFirstName(request.getFirstName());
        entity.setLastName(request.getLastName());
        entity.setEmail(request.getEmail());
        if (request.getPassword() != null &&
                !request.getPassword().trim().isEmpty()) {

            entity.setPassword(
                    passwordHasher.hashPassword(
                            request.getPassword()));
        }
        if (request.getRole() == ERole.ROLE_TEACHER) {
            entity.setIsActive(false);
        } else {
            entity.setIsActive(true);
        }
        entity.setRole(request.getRole());

        entity.setCreatedAt(LocalDateTime.now());
        entity.setUpdatedAt(LocalDateTime.now());
        return entity;
    }

    private boolean validateUser(UserRequest request, GenericResponse response) {
        if (request.getFirstName() == null || request.getFirstName().trim().isEmpty()) {
            response.warning();
            response.getListMessage()
                    .add("El nombre es requerido");
            return false;
        }
        if (request.getLastName() == null || request.getLastName().trim().isEmpty()) {
            response.warning();
            response.getListMessage()
                    .add("El apellido es requerido");
            return false;
        }
        if (request.getEmail() == null || request.getEmail().trim().isEmpty()) {
            response.warning();
            response.getListMessage()
                    .add("El correo electronico es requerido");
            return false;
        }
        if (request.getPassword() == null || request.getPassword().trim().isEmpty()) {
            response.warning();
            response.getListMessage()
                    .add("La contraseña es requerida");
            return false;
        }
        if (request.getRole() == null) {
            response.warning();
            response.getListMessage()
                    .add("El rol es requerido");
            return false;
        }

        if (userRepo.existsByEmail(request.getEmail())) {
            response.warning();
            response.getListMessage()
                    .add("El correo electrónico ya existe");
            return false;
        }

        return true;

    }

    public boolean delete(String idUser, GenericResponse response) {
        EntityUser entity = userRepo.findById(idUser)
                .orElse(null);
        if (entity == null) {
            response.warning();
            response.getListMessage()
                    .add("Usuario no encontrado");

            return false;
        }
        userRepo.delete(entity);

        response.success();
        response.getListMessage()
                .add("Usuario eliminado exitosamente");

        return true;
    }

    public UserResponse convertToResponse(EntityUser entity) {

        UserResponse response = new UserResponse();

        response.setIdUser(entity.getIdUser());
        response.setFirstName(entity.getFirstName());
        response.setSurName(entity.getLastName());
        response.setEmail(entity.getEmail());
        response.setRole(entity.getRole());
        response.setActive(entity.getIsActive());

        return response;
    }

    public List<UserResponse> list() {

        List<EntityUser> userList = userRepo.findAll();

        return userList.stream()
                .map(this::convertToResponse)
                .toList();
    }

    public void update(
            String idUser,
            UserRequest request,
            GenericResponse response) {

        EntityUser entity = userRepo.findById(idUser)
                .orElse(null);

        if (entity == null) {

            response.warning();
            response.getListMessage()
                    .add("Usuario no encontrado");

            return;
        }

        if (request.getFirstName() != null && !request.getFirstName().trim().isEmpty()) {
            entity.setFirstName(request.getFirstName());
        }
        if (request.getLastName() != null && !request.getLastName().trim().isEmpty()) {
            entity.setLastName(request.getLastName());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            entity.setEmail(request.getEmail());
        }

        if (request.getPassword() != null &&
                !request.getPassword().trim().isEmpty() &&
                !request.getPassword().equals("___NOCHANGE___")) {
            entity.setPassword(
                    passwordHasher.hashPassword(
                            request.getPassword()));
        }

        // No forzar isActive: se gestiona con activate/deactivate
        // Solo actualizar rol si se provee explícitamente
        if (request.getRole() != null) {
            entity.setRole(request.getRole());
        }

        entity.setUpdatedAt(LocalDateTime.now());

        userRepo.save(entity);

        response.success();
        response.getListMessage()
                .add("Usuario actualizado exitosamente");
    }

    public List<UserResponse> list(String idUser) {

        List<EntityUser> userList = userRepo.findAll();

        return userList.stream()
                .map(this::convertToResponse)
                .filter(user -> user.getIdUser().equals(idUser))
                .toList();
    }

    public List<ERole> listRoles() {

        return Arrays.asList(ERole.values());
    }

    public boolean activateUser(String idUser, GenericResponse response) {
        EntityUser entity = userRepo.findById(idUser).orElse(null);
        if (entity == null) {
            response.warning();
            response.getListMessage().add("Usuario no encontrado con Id " + idUser);
            return false;
        } else if (Boolean.TRUE.equals(entity.getIsActive())) {
            response.warning();
            response.getListMessage().add("El usuario ya se encuentra activo");
            return false;
        }
        entity.setIsActive(true);
        userRepo.save(entity);
        response.success();
        response.getListMessage().add("El usuario ha sido activado exitosamente");
        return true;
    }

    public boolean deactivateUser(String idUser, GenericResponse response) {
        EntityUser entity = userRepo.findById(idUser).orElse(null);
        if (entity == null) {
            response.warning();
            response.getListMessage().add("Usuario no encontrado con Id " + idUser);
            return false;
        } else if (Boolean.FALSE.equals(entity.getIsActive())) {
            response.warning();
            response.getListMessage().add("El usuario ya se encuentra inactivo");
            return false;
        }
        entity.setIsActive(false);
        userRepo.save(entity);
        response.success();
        response.getListMessage().add("El usuario ha sido desactivado exitosamente");
        return true;
    }

    public List<UserResponse> searchUsers(String name, String email, String role, GenericResponse response) {
        boolean hasParams = false;

        String nameParam = null;
        if (name != null && !name.trim().isEmpty()) {
            nameParam = name.trim();
            hasParams = true;
        }

        String emailParam = null;
        if (email != null && !email.trim().isEmpty()) {
            emailParam = email.trim();
            hasParams = true;
        }

        ERole eRole = null;
        if (role != null && !role.trim().isEmpty()) {
            try {
                eRole = ERole.valueOf(role.toUpperCase());
                hasParams = true;
            } catch (IllegalArgumentException e) {
                // Si el rol es inválido, no debe devolver toda la base de datos, sino una lista
                // vacía.
                response.warning();
                response.getListMessage().add("El rol proporcionado no es válido");
                return java.util.Collections.emptyList();
            }
        }

        // Validación: si no se envía ningún parámetro de búsqueda, no devolvemos toda
        // la data
        if (!hasParams) {
            response.warning();
            response.getListMessage().add("Por favor proporcione al menos un parámetro de búsqueda");
            return java.util.Collections.emptyList();
        }

        List<UserResponse> result = userRepo.searchUsers(nameParam, emailParam, eRole)
                .stream()
                .map(this::convertToResponse)
                .toList();

        if (result.isEmpty()) {
            response.warning();
            response.getListMessage().add("No se encontraron usuarios con los criterios proporcionados");
        } else {
            response.success();
            response.getListMessage().add("Búsqueda exitosa");
        }

        return result;
    }

    public List<UserResponse> getCurrentUser(GenericResponse response) {
        EntityUser user = auth.getCurrentUser();

        response.success();
        return List.of(this.convertToResponse(user));
    }

    public boolean changeRole(String idUser, ERole newRole, GenericResponse response) {
        if (newRole == null) {
            response.warning();
            response.getListMessage().add("El nuevo rol es requerido");
            return false;
        }
        EntityUser entity = userRepo.findById(idUser).orElse(null);
        if (entity == null) {
            response.warning();
            response.getListMessage().add("Usuario no encontrado con Id " + idUser);
            return false;
        }
        entity.setRole(newRole);
        entity.setUpdatedAt(LocalDateTime.now());
        userRepo.save(entity);
        response.success();
        response.getListMessage().add("Rol actualizado exitosamente a " + newRole.name());
        return true;
    }
}
