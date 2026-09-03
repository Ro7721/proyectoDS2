package com.epiis.ds26.business;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import java.util.Optional;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;

import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.enums.ERole;
import com.epiis.ds26.repositorie.UserRepo;

@ExtendWith(MockitoExtension.class)
class UserDetailsServiceImplTest {

    @Mock
    private UserRepo userRepo;

    @InjectMocks
    private UserDetailsServiceImpl userDetailsService;

    @Test
    void loadUserByUsername_userExists_returnsUserDetails() {
        EntityUser user = new EntityUser();
        user.setEmail("user@example.com");
        user.setPassword("hashed_pwd");
        user.setRole(ERole.ROLE_STUDENT);
        user.setIsActive(true);

        when(userRepo.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = userDetailsService.loadUserByUsername("user@example.com");

        assertNotNull(userDetails);
        assertEquals("user@example.com", userDetails.getUsername());
    }

    @Test
    void loadUserByUsername_inactiveUser_returnsDisabledUserDetails() {
        EntityUser user = new EntityUser();
        user.setEmail("inactive@example.com");
        user.setPassword("hashed_pwd");
        user.setRole(ERole.ROLE_TEACHER);
        user.setIsActive(false);

        when(userRepo.findByEmailIgnoreCase("inactive@example.com")).thenReturn(Optional.of(user));

        UserDetails userDetails = userDetailsService.loadUserByUsername(" inactive@example.com ");

        assertFalse(userDetails.isEnabled());
    }

    @Test
    void loadUserByUsername_userNotExists_throwsException() {
        when(userRepo.findByEmailIgnoreCase("user@example.com")).thenReturn(Optional.empty());

        assertThrows(UsernameNotFoundException.class, () -> {
            userDetailsService.loadUserByUsername("user@example.com");
        });
    }
}
