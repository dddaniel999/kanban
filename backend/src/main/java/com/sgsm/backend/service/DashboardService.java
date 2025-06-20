package com.sgsm.backend.service;

import com.sgsm.backend.dto.DashboardDTO;
import com.sgsm.backend.dto.ManagerDashboardDTO;
import com.sgsm.backend.model.User;
import com.sgsm.backend.repository.ProjectMemberRepository;
import com.sgsm.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
public class DashboardService {

    @Autowired private ProjectMemberRepository projectMemberRepository;
    @Autowired private TaskRepository taskRepository;

    public ResponseEntity<DashboardDTO> getDashboardForUser(User user) {
        int projectCount = projectMemberRepository.findByUserId(user.getId()).size();
        int totalTasks = taskRepository.findByAssignedToId(user.getId()).size();

        int todo = taskRepository.countByAssignedToIdAndStatus(user.getId(), "TO_DO");
        int inProgress = taskRepository.countByAssignedToIdAndStatus(user.getId(), "IN_PROGRESS");
        int done = taskRepository.countByAssignedToIdAndStatus(user.getId(), "DONE");
        int late = (int) taskRepository.findByAssignedToId(user.getId()).stream()
                .filter(t -> t.getDeadline() != null &&
                        t.getDeadline().isBefore(LocalDateTime.now()) &&
                        !"DONE".equals(t.getStatus()))
                .count();

        DashboardDTO dto = new DashboardDTO(projectCount, totalTasks, todo, inProgress, done, late);
        return ResponseEntity.ok(dto);
    }

    public ResponseEntity<ManagerDashboardDTO> getDashboardForManager(User user) {
        var managedRelations = projectMemberRepository.findByUserId(user.getId()).stream()
                .filter(pm -> "MANAGER".equals(pm.getRole()))
                .toList();

        int managedProjects = managedRelations.size();
        var projectIds = managedRelations.stream()
                .map(pm -> pm.getProject().getId())
                .toList();

        var allMembers = projectMemberRepository.findByProjectIdIn(projectIds);
        int totalMembers = (int) allMembers.stream()
                .map(pm -> pm.getUser().getId())
                .distinct()
                .count();

        var allTasks = taskRepository.findByProjectIdIn(projectIds);
        int totalTasks = allTasks.size();

        int todo = (int) allTasks.stream().filter(t -> "TO_DO".equals(t.getStatus())).count();
        int inProgress = (int) allTasks.stream().filter(t -> "IN_PROGRESS".equals(t.getStatus())).count();
        int done = (int) allTasks.stream().filter(t -> "DONE".equals(t.getStatus())).count();
        int late = (int) allTasks.stream()
                .filter(t -> t.getDeadline() != null &&
                        t.getDeadline().isBefore(LocalDateTime.now()) &&
                        !"DONE".equals(t.getStatus()))
                .count();

        ManagerDashboardDTO dto = new ManagerDashboardDTO(
                managedProjects, totalMembers, totalTasks, todo, inProgress, done, late
        );

        return ResponseEntity.ok(dto);
    }
}
