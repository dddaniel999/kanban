package com.sgsm.backend.service;

import com.sgsm.backend.dto.TaskDTO;
import com.sgsm.backend.dto.TaskUpdateDTO;
import com.sgsm.backend.model.*;
import com.sgsm.backend.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;

@Service
public class TaskService {

    @Autowired private TaskRepository taskRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private UserRepository userRepository;
    @Autowired private ProjectMemberRepository projectMemberRepository;

    public ResponseEntity<?> createTask(TaskDTO dto, User user) {
        ProjectMember relation = projectMemberRepository.findByUserIdAndProjectId(user.getId(), dto.getProjectId()).orElse(null);

        if (relation == null || !"MANAGER".equals(relation.getRole())) {
            return ResponseEntity.status(403).body(Map.of("error", "Nu ai dreptul să adaugi taskuri în acest proiect."));
        }

        boolean assignedExists = projectMemberRepository.existsByUserIdAndProjectId(dto.getAssignedToId(), dto.getProjectId());
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

    public ResponseEntity<?> getTasks(Long projectId, User user) {
        List<Task> tasks;

        if (projectId != null) {
            // ✅ permite accesul adminului global
            boolean isAdmin = "ADMIN".equals(user.getRole());

            ProjectMember relation = projectMemberRepository.findByUserIdAndProjectId(user.getId(), projectId).orElse(null);
            if (relation == null && !isAdmin) {
                return ResponseEntity.status(403).body("Nu ești membru al proiectului.");
            }

            tasks = taskRepository.findByProjectIdOrderByStatusAscPositionAsc(projectId);
        } else {
            tasks = taskRepository.findByAssignedToId(user.getId());
        }

        return ResponseEntity.ok(tasks);
    }


    public ResponseEntity<?> deleteTask(Long id, User user) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Taskul nu există."));

        ProjectMember relation = projectMemberRepository.findByUserIdAndProjectId(user.getId(), task.getProject().getId()).orElse(null);

        if (relation == null || !"MANAGER".equals(relation.getRole())) {
            return ResponseEntity.status(403).body("Nu ai dreptul să ștergi acest task.");
        }

        taskRepository.delete(task);
        return ResponseEntity.ok("Taskul a fost șters.");
    }

    public ResponseEntity<?> updateTask(Long id, TaskUpdateDTO dto, User user) {
        Task task = taskRepository.findById(id).orElseThrow(() -> new RuntimeException("Taskul nu există."));

        Long projectId = task.getProject().getId();
        ProjectMember relation = projectMemberRepository.findByUserIdAndProjectId(user.getId(), projectId).orElse(null);

        boolean isManager = relation != null && "MANAGER".equals(relation.getRole());
        boolean isAssigned = task.getAssignedTo() != null && task.getAssignedTo().getId().equals(user.getId());

        if (!isManager && !isAssigned) {
            return ResponseEntity.status(403).body("Nu ai permisiunea de a edita acest task.");
        }

        if ("IN_PROGRESS".equals(dto.getStatus()) && !"IN_PROGRESS".equals(task.getStatus())) {
            long wipCount = taskRepository.countByProjectIdAndStatus(projectId, "IN_PROGRESS");
            if (wipCount >= 7) {
                return ResponseEntity.badRequest().body("Limita WIP atinsă: maxim 7 task-uri IN PROGRES!");
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

        List<Task> tasksWithNewStatus = taskRepository
                .findByProjectIdAndStatusOrderByPositionAsc(projectId, dto.getStatus());

        for (int i = 0; i < tasksWithNewStatus.size(); i++) {
            Task t = tasksWithNewStatus.get(i);
            if (t.getPosition() == null || t.getPosition() != i) {
                t.setPosition(i);
                taskRepository.save(t);
            }
        }

        return ResponseEntity.ok(task);
    }
}
