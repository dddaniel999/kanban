package com.sgsm.backend.controller;

import com.sgsm.backend.dto.UserDTO;
import com.sgsm.backend.dto.UserResponseDTO;
import com.sgsm.backend.model.User;
import com.sgsm.backend.security.CustomUserDetails;
import com.sgsm.backend.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<List<UserResponseDTO>> getAllUsers(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User currentUser = userDetails.getUser();
        return ResponseEntity.ok(userService.getAllUsersExcept(currentUser.getId()));
    }

    @PostMapping
    public ResponseEntity<?> createUser(@RequestBody UserDTO dto) {
        return userService.createUser(dto);
    }
}
