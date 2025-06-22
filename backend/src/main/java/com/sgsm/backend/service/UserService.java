package com.sgsm.backend.service;

import com.sgsm.backend.dto.UserDTO;
import com.sgsm.backend.dto.UserResponseDTO;
import com.sgsm.backend.model.User;
import com.sgsm.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<UserResponseDTO> getAllUsersExcept(Long excludedUserId) {
        return userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(excludedUserId))
                .map(user -> new UserResponseDTO(user.getId(), user.getUsername()))
                .toList();
    }

    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll().stream()
                .map(user -> new UserResponseDTO(user.getId(), user.getUsername()))
                .toList();
    }

    public ResponseEntity<?> createUser(UserDTO dto) {
        Optional<User> existing = userRepository.findByUsername(dto.getUsername());
        if (existing.isPresent()) {
            return ResponseEntity.badRequest().body("Username-ul este deja folosit.");
        }

        User user = new User();
        user.setUsername(dto.getUsername());
        user.setPassword(passwordEncoder.encode(dto.getPassword()));
        user.setRole(dto.getRole() != null ? dto.getRole() : "USER");

        userRepository.save(user);
        return ResponseEntity.status(201).body("User creat cu succes.");
    }

    public ResponseEntity<?> deleteUser(Long id) {
        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok("Utilizator șters cu succes.");
    }

    public ResponseEntity<?> updateUser(Long id, UserDTO dto, Long currentUserId) {
        Optional<User> optionalUser = userRepository.findById(id);
        if (optionalUser.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        User user = optionalUser.get();

        // Protejează userii cu rol ADMIN
        if ("ADMIN".equals(user.getRole())) {
            return ResponseEntity.badRequest().body("Nu poți modifica un utilizator ADMIN.");
        }

        // Evită să își modifice propriul cont aici (doar ca protecție suplimentară)
        if (id.equals(currentUserId)) {
            return ResponseEntity.badRequest().body("Nu îți poți modifica propriul cont din acest panou.");
        }

        if (dto.getUsername() != null && !dto.getUsername().isBlank()) {
            user.setUsername(dto.getUsername());
        }

        if (dto.getPassword() != null && !dto.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(dto.getPassword()));
        }

        userRepository.save(user);
        return ResponseEntity.ok("Utilizator actualizat cu succes.");
    }
}
