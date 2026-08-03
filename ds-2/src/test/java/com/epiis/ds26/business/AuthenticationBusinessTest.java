package com.epiis.ds26.business;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationCredentialsNotFoundException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.security.CustomUserDetails;

@ExtendWith(MockitoExtension.class)
class AuthenticationBusinessTest {

    @InjectMocks
    private AuthenticationBusiness authenticationBusiness;

    private SecurityContext originalContext;

    @BeforeEach
    void setUp() {
        originalContext = SecurityContextHolder.getContext();
    }

    @AfterEach
    void tearDown() {
        SecurityContextHolder.setContext(originalContext);
    }

    @Test
    void getCurrentUser_authenticated_returnsUser() {
        EntityUser user = new EntityUser();
        user.setIdUser("user-1");
        CustomUserDetails userDetails = new CustomUserDetails(user);

        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn(userDetails);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        EntityUser result = authenticationBusiness.getCurrentUser();

        assertNotNull(result);
        assertEquals("user-1", result.getIdUser());
    }

    @Test
    void getCurrentUser_notAuthenticated_throwsException() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(false);

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        assertThrows(AuthenticationCredentialsNotFoundException.class, () -> {
            authenticationBusiness.getCurrentUser();
        });
    }

    @Test
    void getCurrentUser_nullAuthentication_throwsException() {
        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(null);
        SecurityContextHolder.setContext(securityContext);

        assertThrows(AuthenticationCredentialsNotFoundException.class, () -> {
            authenticationBusiness.getCurrentUser();
        });
    }

    @Test
    void getCurrentUser_invalidPrincipal_throwsException() {
        Authentication authentication = mock(Authentication.class);
        when(authentication.isAuthenticated()).thenReturn(true);
        when(authentication.getPrincipal()).thenReturn("invalid_principal_string");

        SecurityContext securityContext = mock(SecurityContext.class);
        when(securityContext.getAuthentication()).thenReturn(authentication);
        SecurityContextHolder.setContext(securityContext);

        assertThrows(BadCredentialsException.class, () -> {
            authenticationBusiness.getCurrentUser();
        });
    }
}
