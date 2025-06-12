package com.sgsm.backend.controller;

import com.sgsm.backend.dto.ProjectMemberDTO;
import com.sgsm.backend.dto.UserDTO;
import com.sgsm.backend.dto.UserResponseDTO;
import com.sgsm.backend.model.User;
import com.sgsm.backend.repository.UserRepository;
import com.sgsm.backend.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @GetMapping
    public ResponseEntity<?> getAllUsers() {
        CustomUserDetails userDetails = (CustomUserDetails) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        User currentUser = userDetails.getUser();

        List<UserResponseDTO> users = userRepository.findAll().stream()
                .filter(user -> !user.getId().equals(currentUser.getId()))
                .map(user -> new UserResponseDTO(user.getId(), user.getUsername()))
                .toList();

        return ResponseEntity.ok(users);
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserDTO dto) {
        if (userRepository.findByUsername(dto.getUsername()).isPresent()) {
            return ResponseEntity.badRequest().body("Username-ul este deja folosit.");
        }

        User newUser = new User();
        newUser.setUsername(dto.getUsername());
        newUser.setPassword(passwordEncoder.encode(dto.getPassword()));
        newUser.setRole(dto.getRole() != null ? dto.getRole() : "USER");

        userRepository.save(newUser);
        return ResponseEntity.status(201).body("User creat cu succes.");
    }
}
