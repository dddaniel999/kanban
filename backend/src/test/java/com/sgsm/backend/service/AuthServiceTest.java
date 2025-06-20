package com.sgsm.backend.service;

import com.sgsm.backend.dto.AuthResponse;
import com.sgsm.backend.dto.LoginRequest;
import com.sgsm.backend.model.User;
import com.sgsm.backend.repository.UserRepository;
import com.sgsm.backend.security.JwtUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Map;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JwtUtil jwtUtil;

    @Mock
    private PasswordEncoder passwordEncoder;

    @InjectMocks
    private AuthService authService;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void authenticate_userNotFound_returns401() {
        LoginRequest request = new LoginRequest("john", "pass123");
        when(userRepository.findByUsername("john")).thenReturn(Optional.empty());

        ResponseEntity<?> response = authService.authenticate(request);

        assertEquals(401, response.getStatusCodeValue());
        assertTrue(((Map<?, ?>) response.getBody()).containsKey("error"));
        assertEquals("Utilizatorul nu a fost găsit", ((Map<?, ?>) response.getBody()).get("error"));
    }

    @Test
    void authenticate_wrongPassword_returns401() {
        User user = new User();
        user.setUsername("john");
        user.setPassword("encodedPassword");

        LoginRequest request = new LoginRequest("john", "wrongpass");

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("wrongpass", "encodedPassword")).thenReturn(false);

        ResponseEntity<?> response = authService.authenticate(request);

        assertEquals(401, response.getStatusCodeValue());
        assertEquals("Parolă incorectă", ((Map<?, ?>) response.getBody()).get("error"));
    }

    @Test
    void authenticate_validCredentials_returnsToken() {
        User user = new User();
        user.setUsername("john");
        user.setPassword("encodedPassword");
        user.setRole("USER");

        LoginRequest request = new LoginRequest("john", "correctpass");

        when(userRepository.findByUsername("john")).thenReturn(Optional.of(user));
        when(passwordEncoder.matches("correctpass", "encodedPassword")).thenReturn(true);
        when(jwtUtil.generateToken("john", "USER")).thenReturn("fake.jwt.token");

        ResponseEntity<?> response = authService.authenticate(request);

        assertEquals(200, response.getStatusCodeValue());
        AuthResponse authResponse = (AuthResponse) response.getBody();
        assertNotNull(authResponse);
        assertEquals("fake.jwt.token", authResponse.getToken());
    }
}
