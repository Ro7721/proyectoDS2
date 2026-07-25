package com.epiis.DS26.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.security.web.header.writers.ReferrerPolicyHeaderWriter;

import com.epiis.DS26.config.CorsConfig;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity // Habilita @PreAuthorize / @PostAuthorize en controllers
public class SecurityConfig {
        private final UserDetailsService userDetailsService;
        private final JwtAuthenticationFilter jwtAuthenticationFilter;
        private final CorsConfig corsConfig;

        public SecurityConfig(UserDetailsService userDetailsService, JwtAuthenticationFilter jwtAuthenticationFilter,
                        CorsConfig corsConfig) {
                this.userDetailsService = userDetailsService;
                this.jwtAuthenticationFilter = jwtAuthenticationFilter;
                this.corsConfig = corsConfig;
        }

        @Bean
        public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
                http
                                .cors(cors -> cors.configurationSource(corsConfig.corsConfigurationSource()))
                                .csrf(csrf -> csrf.disable())
                                .authorizeHttpRequests(auth -> auth
                                                .requestMatchers("/auth/login", "/auth/register", "/auth/refresh")
                                                .permitAll()
                                                .requestMatchers("/v3/api-docs/**", "/swagger-ui/**",
                                                                "/swagger-ui.html")
                                                .permitAll()
                                                .requestMatchers("/css/**", "/js/**", "/images/**", "/storage/**",
                                                                "/webjars/**")
                                                .permitAll()
                                                .requestMatchers("/users/**").permitAll()
                                                .requestMatchers("/categories/**").permitAll()
                                                .requestMatchers("/auth/**").permitAll()
                                                .requestMatchers("/lessons/**").permitAll()
                                                .requestMatchers("/courses/**").permitAll()
                                                .requestMatchers("/admin/**").hasAuthority("ROLE_ADMIN")
                                                .requestMatchers("/course-images/**").permitAll()
                                                .requestMatchers("/lesson-videos/**").permitAll()
                                                .requestMatchers("/lesson-files/**").permitAll()
                                                .requestMatchers("/storage/**").permitAll()
                                                .anyRequest().authenticated())
                                // Sesión stateless (no guardar sesión en servidor — usamos JWT)
                                .sessionManagement(session -> session
                                                .sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                                // Proveedor de autenticación
                                .authenticationProvider(authenticationProvider())
                                // Agregar el filtro JWT ANTES del filtro de autenticación estándar
                                .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class)
                                .headers(headers -> headers
                                                .contentSecurityPolicy(
                                                                csp -> csp.policyDirectives("default-src 'self';"))
                                                .referrerPolicy(
                                                                referrer -> referrer.policy(
                                                                                ReferrerPolicyHeaderWriter.ReferrerPolicy.NO_REFERRER))
                                                .frameOptions(frame -> frame.sameOrigin()));

                return http.build();
        }

        @Bean
        public AuthenticationProvider authenticationProvider() {
                DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider(userDetailsService);
                authProvider.setPasswordEncoder(passwordEncoder());
                // Permite que UsernameNotFoundException se propague directamente
                // en lugar de convertirse en BadCredentialsException
                authProvider.setHideUserNotFoundExceptions(false);
                return authProvider;
        }

        @Bean
        public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
                return config.getAuthenticationManager();
        }

        @Bean
        public PasswordEncoder passwordEncoder() {
                return new BCryptPasswordEncoder();
        }
}
