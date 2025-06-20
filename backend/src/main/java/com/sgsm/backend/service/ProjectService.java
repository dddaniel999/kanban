package com.sgsm.backend.service;

import com.sgsm.backend.dto.ProjectDTO;
import com.sgsm.backend.dto.ProjectMemberDTO;
import com.sgsm.backend.dto.ProjectUpdateDTO;
import com.sgsm.backend.dto.ProjectWithRoleDTO;
import com.sgsm.backend.model.Project;
import com.sgsm.backend.model.ProjectMember;
import com.sgsm.backend.model.User;
import com.sgsm.backend.repository.ProjectMemberRepository;
import com.sgsm.backend.repository.ProjectRepository;
import com.sgsm.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProjectService {

    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectMemberRepository projectMemberRepository;
    @Autowired private UserRepository userRepository;

    public List<ProjectWithRoleDTO> getProjectsForUser(User user) {
        return projectMemberRepository.findByUserId(user.getId()).stream()
                .map(pm -> new ProjectWithRoleDTO(
                        pm.getProject().getId(),
                        pm.getProject().getTitle(),
                        pm.getProject().getDescription(),
                        pm.getRole()
                )).toList();
    }

    public ResponseEntity<?> createProject(ProjectDTO dto, User user) {
        Project project = new Project(dto.getTitle(), dto.getDescription());
        Project savedProject = projectRepository.save(project);

        ProjectMember creator = new ProjectMember();
        creator.setUser(user);
        creator.setProject(savedProject);
        creator.setRole("MANAGER");
        projectMemberRepository.save(creator);

        if (dto.getMemberIds() != null) {
            for (Long memberId : dto.getMemberIds()) {
                if (memberId == null || memberId.equals(user.getId())) continue;

                userRepository.findById(memberId).ifPresent(m -> {
                    ProjectMember pm = new ProjectMember();
                    pm.setUser(m);
                    pm.setProject(savedProject);
                    pm.setRole("MEMBER");
                    projectMemberRepository.save(pm);
                });
            }
        }

        return ResponseEntity.ok(savedProject);
    }

    public boolean isUserManagerOfProject(User user, Long projectId) {
        return projectMemberRepository.findByUserIdAndProjectId(user.getId(), projectId)
                .map(pm -> "MANAGER".equals(pm.getRole()))
                .orElse(false);
    }

    public Optional<String> getUserRoleInProject(User user, Long projectId) {
        return projectMemberRepository.findByUserIdAndProjectId(user.getId(), projectId)
                .map(ProjectMember::getRole);
    }

    public List<ProjectMemberDTO> getProjectMembers(Long projectId, User user) {
        if (!projectMemberRepository.existsByUserIdAndProjectId(user.getId(), projectId)) {
            throw new RuntimeException("Nu ai acces la acest proiect.");
        }
        return projectMemberRepository.findByProjectId(projectId).stream()
                .map(pm -> new ProjectMemberDTO(pm.getUser().getId(), pm.getUser().getUsername(), pm.getRole()))
                .toList();
    }

    public ResponseEntity<?> deleteProject(Long projectId, User user) {
        Project project = projectRepository.findById(projectId)
                .orElseThrow(() -> new RuntimeException("Proiectul nu există."));

        ProjectMember relation = projectMemberRepository
                .findByUserIdAndProjectId(user.getId(), projectId)
                .orElse(null);

        if (relation == null || !"MANAGER".equals(relation.getRole())) {
            return ResponseEntity.status(403).body("Nu ai permisiunea de a șterge acest proiect.");
        }

        projectRepository.delete(project);
        return ResponseEntity.ok("Proiectul a fost șters.");
    }

    public ResponseEntity<?> updateProject(Long id, User user, ProjectUpdateDTO updateDTO) {
        Optional<ProjectMember> memberOpt = projectMemberRepository.findByUserIdAndProjectId(user.getId(), id);
        if (memberOpt.isEmpty() || !"MANAGER".equals(memberOpt.get().getRole())) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        Optional<Project> optionalProject = projectRepository.findById(id);
        if (optionalProject.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Project project = optionalProject.get();

        if (updateDTO.getTitle() != null) {
            project.setTitle(updateDTO.getTitle());
        }
        if (updateDTO.getDescription() != null) {
            project.setDescription(updateDTO.getDescription());
        }

        if (updateDTO.getMemberIds() != null) {
            Set<Long> newMemberIds = new HashSet<>(updateDTO.getMemberIds());
            List<ProjectMember> existingMembers = projectMemberRepository.findByProjectId(id);

            for (ProjectMember pm : existingMembers) {
                Long uid = pm.getUser().getId();
                if (!uid.equals(user.getId()) && !newMemberIds.contains(uid)) {
                    projectMemberRepository.delete(pm);
                }
            }

            for (Long memberId : newMemberIds) {
                if (memberId == null || memberId.equals(user.getId())) continue;

                boolean alreadyExists = existingMembers.stream()
                        .anyMatch(pm -> pm.getUser().getId().equals(memberId));

                if (!alreadyExists) {
                    userRepository.findById(memberId).ifPresent(u -> {
                        ProjectMember newMember = new ProjectMember();
                        newMember.setUser(u);
                        newMember.setProject(project);
                        newMember.setRole("MEMBER");
                        projectMemberRepository.save(newMember);
                    });
                }
            }
        }

        projectRepository.save(project);
        return ResponseEntity.ok(Map.of("message", "Proiect actualizat cu succes."));
    }

    public Optional<ProjectDTO> getProjectById(Long id, User user) {
        boolean isMember = projectMemberRepository.existsByProjectIdAndUserId(id, user.getId());
        if (!isMember) return Optional.empty();

        return projectRepository.findById(id).map(ProjectDTO::new);
    }
}
