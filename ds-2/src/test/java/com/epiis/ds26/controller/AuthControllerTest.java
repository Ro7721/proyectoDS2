package com.epiis.ds26.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import java.util.HashMap;
import java.util.Map;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.epiis.ds26.business.UserBusiness;
import com.epiis.ds26.dto.request.LoginRequest;
import com.epiis.ds26.dto.response.LoginResponse;
import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.enums.ERole;
import com.epiis.ds26.security.CustomUserDetails;
import com.epiis.ds26.security.JwtService;

@ExtendWith(MockitoExtension.class)
class AuthControllerTest {

    @Mock
    private AuthenticationManager authManager;

    @Mock
    private JwtService jwtService;

    @Mock
    private UserBusiness userBusiness;

    @InjectMocks
    private AuthController authController;

    private EntityUser user;
    private CustomUserDetails userDetails;
    private SecurityContext originalContext;

    @BeforeEach
    void setUp() {
        user = new EntityUser();
        user.setIdUser("user-1");
        user.setEmail("user@test.com");
        user.setFirstName("Ana");
        user.setLastName("Torres");
        user.setRole(ERole.ROLE_STUDENT);

        userDetails = new CustomUserDetails(user);
        originalContext = SecurityContextHolder.getContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.setContext(originalContext);
    }

    @Test
    void login_success() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@test.com");
        request.setPassword("password");

        Authentication authentication = mock(Authentication.class);
        when(authentication.getPrincipal()).thenReturn(userDetails);
        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class))).thenReturn(authentication);
        when(jwtService.generateToken(anyMap(), eq(userDetails))).thenReturn("access_token");
        when(jwtService.generateRefreshToken(userDetails)).thenReturn("refresh_token");
        when(jwtService.getAccessTokenExpiration()).thenReturn(3600L);

        ResponseEntity<Object> response = authController.login(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof LoginResponse);
        LoginResponse lr = (LoginResponse) response.getBody();
        assertEquals("access_token", lr.getAccessToken());
        assertEquals("refresh_token", lr.getRefreshToken());
    }

    @Test
    void login_badCredentials() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@test.com");
        request.setPassword("password");

        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new BadCredentialsException("invalid"));

        ResponseEntity<Object> response = authController.login(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void login_usernameNotFound() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@test.com");
        request.setPassword("password");

        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new UsernameNotFoundException("not found"));

        ResponseEntity<Object> response = authController.login(request);

        assertEquals(HttpStatus.NOT_FOUND, response.getStatusCode());
    }

    @Test
    void login_unexpectedException() {
        LoginRequest request = new LoginRequest();
        request.setEmail("user@test.com");
        request.setPassword("password");

        when(authManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
                .thenThrow(new RuntimeException("unexpected"));

        ResponseEntity<Object> response = authController.login(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void getCurrentUser_success() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        ResponseEntity<Object> response = authController.getCurrentUser();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof LoginResponse.UserInfo);
        LoginResponse.UserInfo info = (LoginResponse.UserInfo) response.getBody();
        assertEquals("Ana", info.getFirstName());
    }

    @Test
    void getCurrentUser_unauthorized() {
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        ResponseEntity<Object> response = authController.getCurrentUser();

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }

    @Test
    void refreshToken_success() {
        Map<String, String> request = new HashMap<>();
        request.put("refreshToken", "valid_refresh");

        when(jwtService.extractUsername("valid_refresh")).thenReturn("user@test.com");
        when(userBusiness.findByEmail("user@test.com")).thenReturn(user);
        when(jwtService.isValidToken(eq("valid_refresh"), any(CustomUserDetails.class))).thenReturn(true);
        when(jwtService.generateToken(anyMap(), any(CustomUserDetails.class))).thenReturn("new_access_token");

        ResponseEntity<Object> response = authController.refreshToken(request);

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertTrue(response.getBody() instanceof Map);
        Map<String, Object> body = (Map<String, Object>) response.getBody();
        assertEquals("new_access_token", body.get("accessToken"));
    }

    @Test
    void refreshToken_missingToken() {
        Map<String, String> request = new HashMap<>();

        ResponseEntity<Object> response = authController.refreshToken(request);

        assertEquals(HttpStatus.BAD_REQUEST, response.getStatusCode());
    }

    @Test
    void refreshToken_invalidToken() {
        Map<String, String> request = new HashMap<>();
        request.put("refreshToken", "invalid_refresh");

        when(jwtService.extractUsername("invalid_refresh")).thenReturn("user@test.com");
        when(userBusiness.findByEmail("user@test.com")).thenReturn(user);
        when(jwtService.isValidToken(eq("invalid_refresh"), any(CustomUserDetails.class))).thenReturn(false);

        ResponseEntity<Object> response = authController.refreshToken(request);

        assertEquals(HttpStatus.UNAUTHORIZED, response.getStatusCode());
    }
}
