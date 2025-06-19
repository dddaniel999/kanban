package com.sgsm.backend.controller;

import com.sgsm.backend.dto.TaskDTO;
import com.sgsm.backend.dto.TaskUpdateDTO;
import com.sgsm.backend.model.*;
import com.sgsm.backend.repository.*;
import com.sgsm.backend.security.CustomUserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    @Autowired private TaskRepository taskRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProjectMemberRepository projectMemberRepository;

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody TaskDTO dto, @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();

        ProjectMember relation = projectMemberRepository
                .findByUserIdAndProjectId(user.getId(), dto.getProjectId())
                .orElse(null);

        if (relation == null || !"MANAGER".equals(relation.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "Nu ai dreptul să adaugi taskuri în acest proiect."));
        }

        boolean assignedExists = projectMemberRepository
                .existsByUserIdAndProjectId(dto.getAssignedToId(), dto.getProjectId());

        if (!assignedExists) {
            return ResponseEntity.badRequest().body(Map.of("error", "Utilizatorul atribuit nu este membru al proiectului."));
        }

        long wipCount = taskRepository.countByProjectIdAndStatus(dto.getProjectId(), "IN_PROGRESS");
        if ("IN_PROGRESS".equals(dto.getStatus()) && wipCount >= 7) {
            return ResponseEntity.badRequest().body(Map.of("error", "Limita WIP atinsă: maxim 7 taskuri IN_PROGRESS."));
        }

        Project project = projectRepository.findById(dto.getProjectId()).orElseThrow();
        User assignedTo = userRepository.findById(dto.getAssignedToId()).orElseThrow();

        Task task = new Task();
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setStatus(dto.getStatus());
        task.setTags(dto.getTags());
        task.setDeadline(dto.getDeadline());
        task.setProject(project);
        task.setAssignedTo(assignedTo);
        int maxPos = taskRepository.findMaxPositionByStatusAndProjectId(dto.getStatus(), dto.getProjectId());
        task.setPosition(maxPos + 1);



        taskRepository.save(task);

        return ResponseEntity.ok(task);
    }

    @GetMapping
    public ResponseEntity<?> getTasks(
            @RequestParam(required = false) Long projectId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();
        List<Task> tasks;

        if (projectId != null) {
            ProjectMember relation = projectMemberRepository
                    .findByUserIdAndProjectId(user.getId(), projectId)
                    .orElse(null);

            if (relation == null) {
                return ResponseEntity.status(403).body("Nu ești membru al proiectului.");
            }

            tasks = taskRepository.findByProjectId(projectId);
        } else {
            tasks = taskRepository.findByAssignedToId(user.getId());
        }

        return ResponseEntity.ok(tasks);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Taskul nu există."));

        ProjectMember relation = projectMemberRepository
                .findByUserIdAndProjectId(user.getId(), task.getProject().getId())
                .orElse(null);

        if (relation == null || !"MANAGER".equals(relation.getRole())) {
            return ResponseEntity.status(403).body("Nu ai dreptul să ștergi acest task.");
        }

        taskRepository.delete(task);
        return ResponseEntity.ok("Taskul a fost șters.");
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @RequestBody TaskUpdateDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {

        User user = userDetails.getUser();

        Task task = taskRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Taskul nu există."));

        Long projectId = task.getProject().getId();

        ProjectMember relation = projectMemberRepository
                .findByUserIdAndProjectId(user.getId(), projectId)
                .orElse(null);

        boolean isManager = relation != null && "MANAGER".equals(relation.getRole());
        boolean isAssigned = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(user.getId());

        if (!isManager && !isAssigned) {
            return ResponseEntity.status(403).body("Nu ai permisiunea de a edita acest task.");
        }

        if ("IN_PROGRESS".equals(dto.getStatus()) && !"IN_PROGRESS".equals(task.getStatus())) {
            long wipCount = taskRepository.countByProjectIdAndStatus(projectId, "IN_PROGRESS");
            if (wipCount >= 7) {
                return ResponseEntity.badRequest().body("Limita WIP atinsă: maxim 7 taskuri IN_PROGRESS.");
            }
        }

        if (isManager) {
            task.setTitle(dto.getTitle());
            task.setDescription(dto.getDescription());
            task.setTags(dto.getTags());
            task.setDeadline(dto.getDeadline());

            if (dto.getAssignedToId() != null) {
                User assignedUser = userRepository.findById(dto.getAssignedToId())
                        .orElseThrow(() -> new RuntimeException("Userul atribuit nu există."));
                task.setAssignedTo(assignedUser);
            }
        }

        task.setStatus(dto.getStatus());
        if (dto.getPosition() != null) {
            task.setPosition(dto.getPosition());
        }

        taskRepository.save(task);

        return ResponseEntity.ok(task);
    }
}
