package com.epiis.ds26.controller;

import java.util.HashMap;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.epiis.ds26.business.UserBusiness;
import com.epiis.ds26.dto.request.LoginRequest;
import com.epiis.ds26.dto.response.LoginResponse;
import com.epiis.ds26.entity.EntityUser;
import com.epiis.ds26.security.CustomUserDetails;
import com.epiis.ds26.security.JwtService;

import jakarta.validation.Valid;

@RestController
@RequestMapping(path = "auth")
public class AuthController {

    private static final String ERROR_KEY = "error";
    private static final String MESSAGE_KEY = "message";
    private static final String UNAUTHORIZED_CODE = "UNAUTHORIZED";
    private final AuthenticationManager authManager;
    private final JwtService jwtService;
    private final UserBusiness userBusiness;

    public AuthController(AuthenticationManager authManager, JwtService jwtService, UserBusiness userBusiness) {
        this.authManager = authManager;
        this.jwtService = jwtService;
        this.userBusiness = userBusiness;
    }

    @PostMapping(path = "login", consumes = { MediaType.APPLICATION_JSON_VALUE }, produces = {
            MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<Object> login(@Valid @RequestBody LoginRequest request) {
        try {
            Authentication authentication = authManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
            if (!(authentication.getPrincipal() instanceof CustomUserDetails userDetails)) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Error interno: El formato de usuario autenticado no es el esperado.");
            }
            EntityUser user = userDetails.getUser();

            if (user == null) {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body("Usuario no encontrado en el sistema.");
            }

            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("id", user.getIdUser());
            extraClaims.put("email", user.getEmail());
            extraClaims.put("role", user.getRole().getName());

            String accessToken = jwtService.generateToken(extraClaims, userDetails);
            String refreshToken = jwtService.generateRefreshToken(userDetails);

            LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                    user.getIdUser(),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getRole().name());

            LoginResponse response = new LoginResponse(
                    accessToken,
                    refreshToken,
                    jwtService.getAccessTokenExpiration(),
                    userInfo);
            return ResponseEntity.ok(response);
        } catch (DisabledException e) {
            Map<String, String> error = new HashMap<>();
            error.put(ERROR_KEY, "USER_DISABLED");
            error.put(MESSAGE_KEY, "Tu cuenta está inactiva. Solicita su activación al administrador");
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
        } catch (BadCredentialsException e) {
            Map<String, String> error = new HashMap<>();
            error.put(ERROR_KEY, "PASSWORD_INVALID");
            error.put(MESSAGE_KEY, "La contraseña ingresada es incorrecta");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        } catch (UsernameNotFoundException e) {
            Map<String, String> error = new HashMap<>();
            error.put(ERROR_KEY, "EMAIL_NOT_FOUND");
            error.put(MESSAGE_KEY, "El correo no existe o no esta registrado");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put(ERROR_KEY, "AUTH_ERROR");
            error.put(MESSAGE_KEY, "Ocurrio un error inesperado al iniciar sesion");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @GetMapping(path = "me", produces = { MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<Object> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated()) {
            Map<String, String> error = new HashMap<>();
            error.put(ERROR_KEY, UNAUTHORIZED_CODE);
            error.put(MESSAGE_KEY, "No tienes autorizacion para acceder a este recurso");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
        if (!(auth.getPrincipal() instanceof CustomUserDetails userDetails)) {
            Map<String, String> errorAuth = new HashMap<>();
            errorAuth.put(ERROR_KEY, UNAUTHORIZED_CODE);
            errorAuth.put(MESSAGE_KEY, "Sesión inválida o expirada");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(errorAuth);
        }
        EntityUser user = userDetails.getUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        LoginResponse.UserInfo userInfo = new LoginResponse.UserInfo(
                user.getIdUser(),
                user.getFirstName(),
                user.getLastName(),
                user.getEmail(),
                user.getRole().name());
        return ResponseEntity.ok(userInfo);
    }

    @PostMapping(path = "/refresh", consumes = { MediaType.APPLICATION_JSON_VALUE }, produces = {
            MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<Object> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");

        if (refreshToken == null || refreshToken.isBlank()) {
            Map<String, String> error = new HashMap<>();
            error.put(ERROR_KEY, "Token requerido");
            error.put(MESSAGE_KEY, "El refresh token es obligatorio");
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }

        try {
            String userEmail = jwtService.extractUsername(refreshToken);
            EntityUser user = userBusiness.findByEmail(userEmail);
            if (user == null) {
                throw new BadCredentialsException("Token invalido");
            }

            CustomUserDetails userDetails = new CustomUserDetails(user);

            if (!jwtService.isValidToken(refreshToken, userDetails)) {
                Map<String, String> error = new HashMap<>();
                error.put(ERROR_KEY, "Token invalido");
                error.put(MESSAGE_KEY, "El refresh token ha expirado o es invalido");
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
            }

            // Generar nuevo access token
            Map<String, Object> extraClaims = new HashMap<>();
            extraClaims.put("id", user.getIdUser());
            extraClaims.put("email", user.getEmail());
            extraClaims.put("role", user.getRole().getName());

            String newAccessToken = jwtService.generateToken(extraClaims, userDetails);

            Map<String, Object> response = new HashMap<>();
            response.put("accessToken", newAccessToken);
            response.put("expiresIn", jwtService.getAccessTokenExpiration());
            response.put("tokenType", "Bearer");

            return ResponseEntity.ok(response);

        } catch (RuntimeException e) {
            Map<String, String> error = new HashMap<>();
            error.put(ERROR_KEY, "Token invalido");
            error.put(MESSAGE_KEY, "No se pudo procesar el refresh token");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }
    }
}
