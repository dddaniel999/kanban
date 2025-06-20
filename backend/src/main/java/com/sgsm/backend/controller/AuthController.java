package com.sgsm.backend.controller;

import com.sgsm.backend.dto.LoginRequest;
import com.sgsm.backend.dto.AuthResponse;
import com.sgsm.backend.service.AuthService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        return authService.authenticate(request);
    }
}
