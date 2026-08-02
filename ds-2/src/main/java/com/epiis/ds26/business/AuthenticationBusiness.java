package com.epiis.ds26.business;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.security.CustomUserDetails;

@Service
public class AuthenticationBusiness {
    public EntityUser getCurrentUser() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new org.springframework.security.authentication.AuthenticationCredentialsNotFoundException("Usuario no autenticado");
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails userDetails)) {
            throw new org.springframework.security.authentication.BadCredentialsException("Usuario inválido");
        }

        return userDetails.getUser();
    }

}
