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
    private UserRepository userRepository; // Simulare repo care ar oferă acces la utilizatori
    @Mock
    private JwtUtil jwtUtil;  // Simulare utilitarul pentru generarea/verificarea token-urilor JWT
    @Mock
    private PasswordEncoder passwordEncoder;  // Simulare encoder parolă pentru verificarea autentificării
    @InjectMocks
    private AuthService authService; // Injectare mock-uri în clasa testată: AuthService
    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);  // Inițializare mock-uri înainte de fiecare test
    }

    @Test
    void authenticate_userNotFound_returns401() {
        LoginRequest request = new LoginRequest("ion", "pass123"); // simulare cerere autentificare

        when(userRepository.findByUsername("ion")).thenReturn(Optional.empty()); // simulare absență user în DB

        ResponseEntity<?> response = authService.authenticate(request); // apelare metodă autentificare

        assertEquals(401, response.getStatusCodeValue()); // verificare răspuns - cod 401 - neautorizat

        assertTrue(((Map<?, ?>) response.getBody()).containsKey("error")); // verificăm dacă răspunsul conține cheia „error”

        // Verificăm dacă mesajul de eroare este cel așteptat
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
