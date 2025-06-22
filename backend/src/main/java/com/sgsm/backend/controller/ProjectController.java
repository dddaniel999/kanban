package com.sgsm.backend.controller;

import com.sgsm.backend.dto.*;
import com.sgsm.backend.model.User;
import com.sgsm.backend.security.CustomUserDetails;
import com.sgsm.backend.service.ProjectService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/projects")
public class ProjectController {

    @Autowired
    private ProjectService projectService;

    @GetMapping
    public ResponseEntity<List<ProjectWithRoleDTO>> getProjectsForUser(@AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();

        // Dacă are rol global ADMIN returnează toate proiectele și simulează rolul MANAGER
        if (user.getRole() != null && "ADMIN".equals(user.getRole())) {
            return ResponseEntity.ok(projectService.getAllProjectsAsManagerView());
        }

        return ResponseEntity.ok(projectService.getProjectsForUser(user));
    }


    @PostMapping
    public ResponseEntity<?> createProject(@RequestBody ProjectDTO dto, @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        return projectService.createProject(dto, user);
    }

    @GetMapping("/{projectId}/members")
    public ResponseEntity<?> getProjectMembers(@PathVariable Long projectId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        try {
            List<ProjectMemberDTO> members = projectService.getProjectMembers(projectId, user);
            return ResponseEntity.ok(members);
        } catch (RuntimeException e) {
            return ResponseEntity.status(403).body(e.getMessage());
        }
    }

    @DeleteMapping("/{projectId}")
    public ResponseEntity<?> deleteProject(@PathVariable Long projectId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        return projectService.deleteProject(projectId, user);
    }

    @GetMapping("/{projectId}/role/self")
    public ResponseEntity<?> getUserRoleInProject(@PathVariable Long projectId, @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        Optional<String> roleOpt = projectService.getUserRoleInProject(user, projectId);
        return roleOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(403).body("Not a member"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateProject(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails,
            @RequestBody ProjectUpdateDTO updateDTO
    ) {
        User user = userDetails.getUser();
        return projectService.updateProject(id, user, updateDTO);
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProjectById(
            @PathVariable Long id,
            @AuthenticationPrincipal CustomUserDetails userDetails
    ) {
        User user = userDetails.getUser();
        Optional<ProjectDTO> projectOpt = projectService.getProjectById(id, user);
        return projectOpt.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(403).build());
    }


}