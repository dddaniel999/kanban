package com.sgsm.backend.controller;

import com.sgsm.backend.dto.LoginRequest;
import com.sgsm.backend.dto.AuthResponse;
import com.sgsm.backend.model.User;
import com.sgsm.backend.repository.UserRepository;
import com.sgsm.backend.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController // definim clasa ca un controller REST
@RequestMapping("/auth") // prefix rutare pentru acest controller
public class AuthController {

    @Autowired
    private UserRepository userRepository; // Pentru a căuta utilizatori în baza de date

    @Autowired
    private JwtUtil jwtUtil; // Utilitar pentru generarea tokenului JWT

    @Autowired
    private PasswordEncoder passwordEncoder; // Pentru verificarea parolelor criptate

    @PostMapping("/login") // Endpoint POST pentru autentificare
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        // Caută utilizatorul după username în baza de date
        Optional<User> userOpt = userRepository.findByUsername(request.getUsername());

        // Dacă nu există utilizatorul, returnăm eroare 401 (Unauthorized)
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("error", "Utilizatorul nu a fost găsit"));
        }

        User user = userOpt.get(); // Obținem User

        // Verificăm dacă parola introdusă se potrivește cu cea criptată din baza de date
        if (!passwordEncoder.matches(request.getPassword(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("error", "Parolă incorectă"));
        }

        // Generăm un token JWT valid pentru utilizatorul autentificat
        String token = jwtUtil.generateToken(user.getUsername(), user.getRole());

        // Returnează tokenul JWT în răspunsul HTTP (cu cod 200- OK)
        return ResponseEntity.ok(new AuthResponse(token));
    }
}
