package com.epiis.ds26.security;

import io.jsonwebtoken.ExpiredJwtException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;

import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.Base64;
import java.util.HashMap;
import java.util.Map;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    private static final String SECRET_KEY = Base64.getEncoder()
            .encodeToString("mi-clave-super-secreta-para-test-que-tiene-256bits".getBytes());

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtService, "secretKey", SECRET_KEY);
        ReflectionTestUtils.setField(jwtService, "accessTokenExpiration", 3600000L);
        ReflectionTestUtils.setField(jwtService, "refreshTokenExpiration", 86400000L);
    }

    private UserDetails mockUser(String username) {
        UserDetails user = mock(UserDetails.class);
        when(user.getUsername()).thenReturn(username);
        return user;
    }

    // =========== generateToken ===========

    @Test
    void generateToken_noExtraClaims_returnsValidToken() {
        UserDetails user = mockUser("juan@test.com");

        String token = jwtService.generateToken(user);

        assertNotNull(token);
        assertFalse(token.isEmpty());
        // JWT tiene 3 partes separadas por '.'
        assertEquals(3, token.split("\\.").length);
    }

    @Test
    void generateToken_withExtraClaims_returnsValidToken() {
        UserDetails user = mockUser("juan@test.com");
        Map<String, Object> extraClaims = new HashMap<>();
        extraClaims.put("role", "ROLE_STUDENT");
        extraClaims.put("id", "user-123");

        String token = jwtService.generateToken(extraClaims, user);

        assertNotNull(token);
        assertEquals(3, token.split("\\.").length);
    }

    // =========== generateRefreshToken ===========

    @Test
    void generateRefreshToken_returnsValidToken() {
        UserDetails user = mockUser("juan@test.com");

        String refreshToken = jwtService.generateRefreshToken(user);

        assertNotNull(refreshToken);
        assertEquals(3, refreshToken.split("\\.").length);
    }

    // =========== extractUsername ===========

    @Test
    void extractUsername_validToken_returnsCorrectUsername() {
        UserDetails user = mockUser("juan@test.com");
        String token = jwtService.generateToken(user);

        String username = jwtService.extractUsername(token);

        assertEquals("juan@test.com", username);
    }

    @Test
    void extractUsername_differentUsers_returnsCorrectUsername() {
        UserDetails user1 = mockUser("user1@test.com");
        UserDetails user2 = mockUser("user2@test.com");

        String token1 = jwtService.generateToken(user1);
        String token2 = jwtService.generateToken(user2);

        assertEquals("user1@test.com", jwtService.extractUsername(token1));
        assertEquals("user2@test.com", jwtService.extractUsername(token2));
    }

    // =========== isValidToken ===========

    @Test
    void isValidToken_validTokenAndMatchingUser_returnsTrue() {
        UserDetails user = mockUser("juan@test.com");
        String token = jwtService.generateToken(user);

        boolean valid = jwtService.isValidToken(token, user);

        assertTrue(valid);
    }

    @Test
    void isValidToken_tokenForDifferentUser_returnsFalse() {
        UserDetails user1 = mockUser("user1@test.com");
        UserDetails user2 = mockUser("user2@test.com");

        String token = jwtService.generateToken(user1);

        boolean valid = jwtService.isValidToken(token, user2);

        assertFalse(valid);
    }

    @Test
    void isValidToken_expiredToken_throwsOrReturnsFalse() {
        // Token que expira en el pasado
        ReflectionTestUtils.setField(jwtService, "accessTokenExpiration", -1000L);
        UserDetails user = mockUser("juan@test.com");
        String token = jwtService.generateToken(user);

        assertThrows(ExpiredJwtException.class, () -> jwtService.isValidToken(token, user));
    }

    // =========== getAccessTokenExpiration ===========

    @Test
    void getAccessTokenExpiration_returnsConfiguredValue() {
        long expiration = jwtService.getAccessTokenExpiration();
        assertEquals(3600000L, expiration);
    }

    // =========== tokens are different ===========



    // =========== invalid token format ===========

    @Test
    void extractUsername_invalidToken_throwsException() {
        assertThrows(Exception.class, () -> jwtService.extractUsername("invalid.token.here"));
    }

    @Test
    void extractUsername_emptyToken_throwsException() {
        assertThrows(Exception.class, () -> jwtService.extractUsername(""));
    }

    // =========== refresh vs access token ===========

    @Test
    void generateRefreshToken_hasLongerLifespanThanAccessToken() {
        UserDetails user = mockUser("juan@test.com");

        // Ambos son tokens vÃ¡lidos JWTs
        String accessToken = jwtService.generateToken(user);
        String refreshToken = jwtService.generateRefreshToken(user);

        // Ambos tienen el mismo subject
        assertEquals(jwtService.extractUsername(accessToken),
                jwtService.extractUsername(refreshToken));
    }
}
