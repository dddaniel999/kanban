package com.sgsm.backend.controller;

import com.sgsm.backend.dto.UserDTO;
import com.sgsm.backend.dto.UserResponseDTO;
import com.sgsm.backend.model.User;
import com.sgsm.backend.repository.UserRepository;
import com.sgsm.backend.security.CustomUserDetails;
import com.sgsm.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @Autowired
    private UserRepository userRepository;

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        return ResponseEntity.ok(userService.getAllUsersExcept(currentUser.getId()));
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/all")
    public ResponseEntity<List<UserResponseDTO>> getAllUsersAdmin() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserDTO dto) {
        return userService.createUser(dto);
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteUser(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        Long currentUserId = userDetails.getUser().getId();

        if (id.equals(currentUserId)) {
            return ResponseEntity.badRequest().body("Nu poți să te ștergi singur.");
        }

        Optional<User> user = userRepository.findById(id);
        if (user.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        userRepository.deleteById(id);
        return ResponseEntity.ok("Utilizator șters cu succes.");
    }

    @PreAuthorize("hasAuthority('ADMIN')")
    @PutMapping("/{id}")
    public ResponseEntity<?> updateUser(
            @PathVariable Long id,
            @RequestBody UserDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        return userService.updateUser(id, dto, userDetails.getUser().getId());
    }
}

