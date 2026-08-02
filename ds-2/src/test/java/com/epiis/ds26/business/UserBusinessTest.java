package com.epiis.ds26.business;

import com.epiis.ds26.dto.request.UserRequest;
import com.epiis.ds26.dto.response.UserResponse;
import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.enums.ERole;
import com.epiis.ds26.message.GenericResponse;
import com.epiis.ds26.repositorie.UserRepo;
import com.epiis.ds26.security.PasswordHasher;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class UserBusinessTest {

    @Mock
    private UserRepo userRepo;

    @Mock
    private PasswordHasher passwordHasher;

    @Mock
    private AuthenticationBusiness auth;

    @InjectMocks
    private UserBusiness userBusiness;

    private EntityUser sampleUser;
    private UserRequest sampleRequest;

    @BeforeEach
    void setUp() {
        sampleUser = new EntityUser();
        sampleUser.setIdUser("user-123");
        sampleUser.setFirstName("Juan");
        sampleUser.setLastName("Perez");
        sampleUser.setEmail("juan@test.com");
        sampleUser.setPassword("hashedPass");
        sampleUser.setRole(ERole.ROLE_STUDENT);
        sampleUser.setIsActive(true);

        sampleRequest = new UserRequest();
        sampleRequest.setFirstName("Juan");
        sampleRequest.setLastName("Perez");
        sampleRequest.setEmail("juan@test.com");
        sampleRequest.setPassword("Pass@123");
        sampleRequest.setRole(ERole.ROLE_STUDENT);
    }

    // =========== findByEmail ===========

    @Test
    void findByEmail_exists_returnsUser() {
        when(userRepo.findByEmailAndIsActiveTrue("juan@test.com"))
                .thenReturn(Optional.of(sampleUser));

        EntityUser result = userBusiness.findByEmail("juan@test.com");

        assertNotNull(result);
        assertEquals("juan@test.com", result.getEmail());
    }

    @Test
    void findByEmail_notExists_returnsNull() {
        when(userRepo.findByEmailAndIsActiveTrue("noexist@test.com"))
                .thenReturn(Optional.empty());

        EntityUser result = userBusiness.findByEmail("noexist@test.com");

        assertNull(result);
    }

    // =========== insert ===========

    @Test
    void insert_validRequest_savesAndReturnsUser() {
        when(userRepo.existsByEmail("juan@test.com")).thenReturn(false);
        when(passwordHasher.hashPassword("Pass@123")).thenReturn("hashed");
        when(userRepo.save(any(EntityUser.class))).thenReturn(sampleUser);

        GenericResponse response = new GenericResponse();
        EntityUser result = userBusiness.insert(sampleRequest, response);

        assertNotNull(result);
        assertEquals("success", response.getType());
        assertTrue(response.getListMessage().contains("Usuario creado exitosamente"));
        verify(userRepo).save(any(EntityUser.class));
    }

    @Test
    void insert_missingFirstName_returnsNull() {
        sampleRequest.setFirstName("");
        GenericResponse response = new GenericResponse();

        EntityUser result = userBusiness.insert(sampleRequest, response);

        assertNull(result);
        assertEquals("warning", response.getType());
        assertTrue(response.getListMessage().contains("El nombre es requerido"));
        verify(userRepo, never()).save(any());
    }

    @Test
    void insert_missingLastName_returnsNull() {
        sampleRequest.setLastName(null);
        GenericResponse response = new GenericResponse();

        EntityUser result = userBusiness.insert(sampleRequest, response);

        assertNull(result);
        assertEquals("warning", response.getType());
        assertTrue(response.getListMessage().contains("El apellido es requerido"));
    }

    @Test
    void insert_missingEmail_returnsNull() {
        sampleRequest.setEmail("");
        GenericResponse response = new GenericResponse();

        EntityUser result = userBusiness.insert(sampleRequest, response);

        assertNull(result);
        assertEquals("warning", response.getType());
        assertTrue(response.getListMessage().contains("El correo electronico es requerido"));
    }

    @Test
    void insert_missingPassword_returnsNull() {
        sampleRequest.setPassword(null);
        GenericResponse response = new GenericResponse();

        EntityUser result = userBusiness.insert(sampleRequest, response);

        assertNull(result);
        assertEquals("warning", response.getType());
        assertTrue(response.getListMessage().contains("La contraseÃ±a es requerida"));
    }

    @Test
    void insert_missingRole_returnsNull() {
        sampleRequest.setRole(null);
        GenericResponse response = new GenericResponse();

        EntityUser result = userBusiness.insert(sampleRequest, response);

        assertNull(result);
        assertEquals("warning", response.getType());
        assertTrue(response.getListMessage().contains("El rol es requerido"));
    }

    @Test
    void insert_duplicateEmail_returnsNull() {
        when(userRepo.existsByEmail("juan@test.com")).thenReturn(true);

        GenericResponse response = new GenericResponse();
        EntityUser result = userBusiness.insert(sampleRequest, response);

        assertNull(result);
        assertEquals("warning", response.getType());
        assertTrue(response.getListMessage().contains("El correo electrÃ³nico ya existe"));
    }

    @Test
    void insert_teacherRole_isInactive() {
        sampleRequest.setRole(ERole.ROLE_TEACHER);
        when(userRepo.existsByEmail(any())).thenReturn(false);
        when(passwordHasher.hashPassword(any())).thenReturn("hashed");
        when(userRepo.save(any(EntityUser.class))).thenAnswer(inv -> {
            EntityUser u = inv.getArgument(0);
            return u;
        });

        GenericResponse response = new GenericResponse();
        userBusiness.insert(sampleRequest, response);

        verify(userRepo).save(argThat(u -> Boolean.FALSE.equals(u.getIsActive())));
    }

    // =========== delete ===========

    @Test
    void delete_existingUser_deletesSuccessfully() {
        when(userRepo.findById("user-123")).thenReturn(Optional.of(sampleUser));

        GenericResponse response = new GenericResponse();
        boolean result = userBusiness.delete("user-123", response);

        assertTrue(result);
        assertEquals("success", response.getType());
        assertTrue(response.getListMessage().contains("Usuario eliminado exitosamente"));
        verify(userRepo).delete(sampleUser);
    }

    @Test
    void delete_nonExistentUser_returnsFalse() {
        when(userRepo.findById("bad-id")).thenReturn(Optional.empty());

        GenericResponse response = new GenericResponse();
        boolean result = userBusiness.delete("bad-id", response);

        assertFalse(result);
        assertEquals("warning", response.getType());
        assertTrue(response.getListMessage().contains("Usuario no encontrado para eliminar"));
        verify(userRepo, never()).delete(any());
    }

    // =========== convertToResponse ===========

    @Test
    void convertToResponse_mapsFieldsCorrectly() {
        UserResponse response = userBusiness.convertToResponse(sampleUser);

        assertEquals("user-123", response.getIdUser());
        assertEquals("Juan", response.getFirstName());
        assertEquals("Perez", response.getSurName());
        assertEquals("juan@test.com", response.getEmail());
        assertEquals(ERole.ROLE_STUDENT, response.getRole());
        assertTrue(response.isActive());
    }

    // =========== list ===========

    @Test
    void list_returnsAllUsers() {
        EntityUser user2 = new EntityUser();
        user2.setIdUser("user-456");
        user2.setFirstName("Ana");
        user2.setLastName("Lopez");
        user2.setEmail("ana@test.com");
        user2.setRole(ERole.ROLE_TEACHER);
        user2.setIsActive(false);

        when(userRepo.findAll()).thenReturn(Arrays.asList(sampleUser, user2));

        List<UserResponse> result = userBusiness.list();

        assertEquals(2, result.size());
    }

    // =========== update ===========

    @Test
    void update_existingUser_updatesFields() {
        when(userRepo.findById("user-123")).thenReturn(Optional.of(sampleUser));

        UserRequest updateRequest = new UserRequest();
        updateRequest.setFirstName("Carlos");
        updateRequest.setLastName("Gomez");
        updateRequest.setEmail("carlos@test.com");
        updateRequest.setPassword("___NOCHANGE___");

        GenericResponse response = new GenericResponse();
        userBusiness.update("user-123", updateRequest, response);

        assertEquals("success", response.getType());
        assertTrue(response.getListMessage().contains("Usuario actualizado exitosamente"));
        verify(userRepo).save(any(EntityUser.class));
    }

    @Test
    void update_nonExistentUser_doesNothing() {
        when(userRepo.findById("bad-id")).thenReturn(Optional.empty());

        GenericResponse response = new GenericResponse();
        userBusiness.update("bad-id", sampleRequest, response);

        assertEquals("warning", response.getType());
        assertTrue(response.getListMessage().contains("Usuario no encontrado para actualizar"));
        verify(userRepo, never()).save(any());
    }

    @Test
    void update_withNewPassword_hashesPassword() {
        when(userRepo.findById("user-123")).thenReturn(Optional.of(sampleUser));
        when(passwordHasher.hashPassword("NewPass@1")).thenReturn("newhash");

        UserRequest req = new UserRequest();
        req.setFirstName("Juan");
        req.setLastName("Perez");
        req.setEmail("juan@test.com");
        req.setPassword("NewPass@1");

        GenericResponse response = new GenericResponse();
        userBusiness.update("user-123", req, response);

        verify(passwordHasher).hashPassword("NewPass@1");
    }

    // =========== activateUser ===========

    @Test
    void activateUser_inactiveUser_activatesSuccessfully() {
        sampleUser.setIsActive(false);
        when(userRepo.findById("user-123")).thenReturn(Optional.of(sampleUser));

        GenericResponse response = new GenericResponse();
        boolean result = userBusiness.activateUser("user-123", response);

        assertTrue(result);
        assertEquals("success", response.getType());
        assertTrue(response.getListMessage().contains("El usuario ha sido activado exitosamente"));
        verify(userRepo).save(sampleUser);
    }

    @Test
    void activateUser_alreadyActive_returnsFalse() {
        sampleUser.setIsActive(true);
        when(userRepo.findById("user-123")).thenReturn(Optional.of(sampleUser));

        GenericResponse response = new GenericResponse();
        boolean result = userBusiness.activateUser("user-123", response);

        assertFalse(result);
        assertEquals("warning", response.getType());
        assertTrue(response.getListMessage().contains("El usuario ya se encuentra activo"));
    }

    @Test
    void activateUser_notFound_returnsFalse() {
        when(userRepo.findById("bad")).thenReturn(Optional.empty());

        GenericResponse response = new GenericResponse();
        boolean result = userBusiness.activateUser("bad", response);

        assertFalse(result);
        assertEquals("warning", response.getType());
        assertTrue(response.getListMessage().contains("Usuario no encontrado para activar"));
    }

    // =========== deactivateUser ===========

    @Test
    void deactivateUser_activeUser_deactivatesSuccessfully() {
        sampleUser.setIsActive(true);
        when(userRepo.findById("user-123")).thenReturn(Optional.of(sampleUser));

        GenericResponse response = new GenericResponse();
        boolean result = userBusiness.deactivateUser("user-123", response);

        assertTrue(result);
        assertEquals("success", response.getType());
        assertTrue(response.getListMessage().contains("El usuario ha sido desactivado exitosamente"));
    }

    @Test
    void deactivateUser_alreadyInactive_returnsFalse() {
        sampleUser.setIsActive(false);
        when(userRepo.findById("user-123")).thenReturn(Optional.of(sampleUser));

        GenericResponse response = new GenericResponse();
        boolean result = userBusiness.deactivateUser("user-123", response);

        assertFalse(result);
        assertEquals("warning", response.getType());
        assertTrue(response.getListMessage().contains("El usuario ya se encuentra inactivo"));
    }

    @Test
    void deactivateUser_notFound_returnsFalse() {
        when(userRepo.findById("bad")).thenReturn(Optional.empty());

        GenericResponse response = new GenericResponse();
        boolean result = userBusiness.deactivateUser("bad", response);

        assertFalse(result);
        assertEquals("warning", response.getType());
    }

    // =========== changeRole ===========

    @Test
    void changeRole_validRequest_changesRoleSuccessfully() {
        when(userRepo.findById("user-123")).thenReturn(Optional.of(sampleUser));

        GenericResponse response = new GenericResponse();
        boolean result = userBusiness.changeRole("user-123", ERole.ROLE_ADMIN, response);

        assertTrue(result);
        assertEquals("success", response.getType());
        assertTrue(response.getListMessage().contains("Rol actualizado exitosamente a ROLE_ADMIN"));
        verify(userRepo).save(sampleUser);
    }

    @Test
    void changeRole_nullRole_returnsFalse() {
        GenericResponse response = new GenericResponse();
        boolean result = userBusiness.changeRole("user-123", null, response);

        assertFalse(result);
        assertEquals("warning", response.getType());
        assertTrue(response.getListMessage().contains("El nuevo rol es requerido"));
    }

    @Test
    void changeRole_userNotFound_returnsFalse() {
        when(userRepo.findById("bad")).thenReturn(Optional.empty());

        GenericResponse response = new GenericResponse();
        boolean result = userBusiness.changeRole("bad", ERole.ROLE_TEACHER, response);

        assertFalse(result);
        assertEquals("warning", response.getType());
    }

    // =========== searchUsers ===========

    @Test
    void searchUsers_noParams_returnsEmpty() {
        GenericResponse response = new GenericResponse();
        List<UserResponse> result = userBusiness.searchUsers(null, null, null, response);

        assertTrue(result.isEmpty());
        assertEquals("warning", response.getType());
    }

    @Test
    void searchUsers_invalidRole_returnsEmpty() {
        GenericResponse response = new GenericResponse();
        List<UserResponse> result = userBusiness.searchUsers(null, null, "ROL_INVALIDO", response);

        assertTrue(result.isEmpty());
        assertEquals("warning", response.getType());
        assertTrue(response.getListMessage().contains("El rol proporcionado no es vÃ¡lido"));
    }

    @Test
    void searchUsers_validParams_returnsResults() {
        when(userRepo.searchUsers(eq("Juan"), isNull(), isNull()))
                .thenReturn(Collections.singletonList(sampleUser));

        GenericResponse response = new GenericResponse();
        List<UserResponse> result = userBusiness.searchUsers("Juan", null, null, response);

        assertEquals(1, result.size());
        assertEquals("success", response.getType());
    }

    @Test
    void searchUsers_validParamsNoResults_returnsWarning() {
        when(userRepo.searchUsers(any(), any(), any()))
                .thenReturn(Collections.emptyList());

        GenericResponse response = new GenericResponse();
        List<UserResponse> result = userBusiness.searchUsers("Inexistente", null, null, response);

        assertTrue(result.isEmpty());
        assertEquals("warning", response.getType());
    }

    // =========== listRoles ===========

    @Test
    void listRoles_returnsAllRoles() {
        List<ERole> roles = userBusiness.listRoles();
        assertEquals(3, roles.size());
        assertTrue(roles.contains(ERole.ROLE_ADMIN));
        assertTrue(roles.contains(ERole.ROLE_TEACHER));
        assertTrue(roles.contains(ERole.ROLE_STUDENT));
    }

    // =========== getCurrentUser ===========

    @Test
    void getCurrentUser_returnsCurrentUserResponse() {
        when(auth.getCurrentUser()).thenReturn(sampleUser);

        GenericResponse response = new GenericResponse();
        List<UserResponse> result = userBusiness.getCurrentUser(response);

        assertEquals(1, result.size());
        assertEquals("juan@test.com", result.get(0).getEmail());
        assertEquals("success", response.getType());
    }
}
