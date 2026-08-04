package com.epiis.ds26.business;

import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Arrays;
import java.util.List;
import java.util.UUID;

import org.springframework.stereotype.Service;

import com.epiis.ds26.dto.request.UserRequest;
import com.epiis.ds26.dto.response.UserResponse;
import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.enums.ERole;
import com.epiis.ds26.message.GenericResponse;
import com.epiis.ds26.repositorie.UserRepo;
import com.epiis.ds26.security.PasswordHasher;

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
        entity.setIsActive(request.getRole() != ERole.ROLE_TEACHER);
        entity.setRole(request.getRole());

        entity.setCreatedAt(LocalDateTime.now(ZoneId.systemDefault()));
        entity.setUpdatedAt(LocalDateTime.now(ZoneId.systemDefault()));
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
                    .add("La contraseÃ±a es requerida");
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
                    .add("El correo electrÃ³nico ya existe");
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
                    .add("Usuario no encontrado para eliminar");

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
                    .add("Usuario no encontrado para actualizar");

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
        // Solo actualizar rol si se provee explÃ­citamente
        if (request.getRole() != null) {
            entity.setRole(request.getRole());
        }

        entity.setUpdatedAt(LocalDateTime.now(ZoneId.systemDefault()));

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
            response.getListMessage().add("Usuario no encontrado para activar");
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
            response.getListMessage().add("Usuario no encontrado para desactivar");
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
                // Si el rol es invÃ¡lido, no debe devolver toda la base de datos, sino una lista
                // vacÃ­a.
                response.warning();
                response.getListMessage().add("El rol proporcionado no es vÃ¡lido");
                return java.util.Collections.emptyList();
            }
        }

        // ValidaciÃ³n: si no se envÃ­a ningÃºn parÃ¡metro de bÃºsqueda, no devolvemos toda
        // la data
        if (!hasParams) {
            response.warning();
            response.getListMessage().add("Por favor proporcione al menos un parÃ¡metro de bÃºsqueda");
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
            response.getListMessage().add("BÃºsqueda exitosa");
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
        entity.setUpdatedAt(LocalDateTime.now(ZoneId.of("America/Lima")));
        userRepo.save(entity);
        response.success();
        response.getListMessage().add("Rol actualizado exitosamente a " + newRole.name());
        return true;
    }
}
