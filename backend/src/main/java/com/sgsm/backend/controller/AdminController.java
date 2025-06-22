package com.sgsm.backend.controller;

import com.sgsm.backend.dto.ProjectDTO;
import com.sgsm.backend.dto.TaskDTO;
import com.sgsm.backend.service.AdminService;
import com.sgsm.backend.service.ProjectService;
import com.sgsm.backend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

@RestController
@RequestMapping("/admin")
public class AdminController {
    @Autowired
    private AdminService adminService;
    @PreAuthorize("hasAuthority('ADMIN')")
    @GetMapping("/ping")
    public ResponseEntity<String> testAdminAccess() {
        return ResponseEntity.ok("Ai acces ADMIN global!");
    }



    @GetMapping("/projects")
    public ResponseEntity<?> getAllProjects() {
        return ResponseEntity.ok(adminService.getAllProjects());
    }

    @GetMapping("/tasks")
    public ResponseEntity<?> getAllTasks() {
        return ResponseEntity.ok(adminService.getAllTasks());
    }
}