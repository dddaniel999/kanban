package com.sgsm.backend.service;

import com.sgsm.backend.model.User;
import com.sgsm.backend.repository.ProjectMemberRepository;
import org.springframework.stereotype.Service;

@Service
public class PermissionService {

    public boolean isAdmin(User user) {
        return user.getRole() != null && user.getRole().equals("ADMIN");
    }

    public boolean isManager(String role) {
        return "MANAGER".equals(role);
    }

    public boolean isManagerOfProject(User user, Long projectId, ProjectMemberRepository repo) {
        return repo.findByUserIdAndProjectId(user.getId(), projectId)
                .map(pm -> "MANAGER".equals(pm.getRole()))
                .orElse(false);
    }
}