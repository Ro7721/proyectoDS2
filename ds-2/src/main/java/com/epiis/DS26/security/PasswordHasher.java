package com.epiis.DS26.security;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
public class PasswordHasher {
    private final PasswordEncoder passwordEncoder;

    public PasswordHasher() {
        this.passwordEncoder = new BCryptPasswordEncoder(10);
    }

    public String hashPassword(String plainPassword) {
        if (plainPassword == null || plainPassword.trim().isEmpty()) {
            throw new IllegalArgumentException("La Contraseña no puede estar vaciar");
        }
        return passwordEncoder.encode(plainPassword);
    }

    public boolean verifyPassword(String plainPassword, String hashPassword) {
        if (plainPassword == null || hashPassword == null) {
            return false;
        }
        return passwordEncoder.matches(plainPassword, hashPassword);
    }

    public boolean needUpgrade(String hashPassword) {
        return passwordEncoder.upgradeEncoding(hashPassword);
    }

    public PasswordEncoder getPasswordEncoder() {
        return this.passwordEncoder;
    }
}
