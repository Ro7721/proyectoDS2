package com.epiis.DS26.business;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.epiis.DS26.entity.EntityUser;
import com.epiis.DS26.security.CustomUserDetails;

@Service
public class AuthenticationBusiness {
    public EntityUser getCurrentUser() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new RuntimeException("Usuario no autenticado");
        }

        Object principal = authentication.getPrincipal();

        if (!(principal instanceof CustomUserDetails userDetails)) {
            throw new RuntimeException("Usuario inválido");
        }

        return userDetails.getUser();
    }

}
