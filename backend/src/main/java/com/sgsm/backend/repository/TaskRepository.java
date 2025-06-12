package com.sgsm.backend.repository;

import com.sgsm.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, String status); // pentru WIP
    List<Task> findByAssignedToId(Long userId);

    List<Task> findByProjectIdAndAssignedToId(Long projectId, Long userId);

    int countByAssignedToIdAndStatus(Long userId, String status);

    List<Task> findByProjectIdIn(List<Long> projectIds);


}
