package com.epiis.ds26.business;

import java.util.Optional;

import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.repositorie.UserRepo;
import com.epiis.ds26.security.CustomUserDetails;

@Service
public class UserDetailsServiceImpl implements UserDetailsService {
    private final UserRepo userRepo;

    public UserDetailsServiceImpl(UserRepo userRepo) {
        this.userRepo = userRepo;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Optional<EntityUser> user = userRepo.findByEmailAndIsActiveTrue(email);
        if (user.isEmpty()) {
            throw new UsernameNotFoundException("Usuario no encontrado: " + email);
        }
        return new CustomUserDetails(user.get());
    }
}
