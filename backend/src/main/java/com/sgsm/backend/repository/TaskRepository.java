package com.sgsm.backend.repository;

import com.sgsm.backend.model.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface TaskRepository extends JpaRepository<Task, Long> {
    List<Task> findByProjectId(Long projectId);

    long countByProjectIdAndStatus(Long projectId, String status); // pentru WIP
    List<Task> findByAssignedToId(Long userId);

    List<Task> findByProjectIdAndAssignedToId(Long projectId, Long userId);

    int countByAssignedToIdAndStatus(Long userId, String status);

    List<Task> findByProjectIdIn(List<Long> projectIds);

    List<Task> findByProjectIdOrderByStatusAscPositionAsc(Long projectId);
    List<Task> findByProjectIdAndStatusOrderByPositionAsc(Long projectId, String status);


    @Query("SELECT COALESCE(MAX(t.position), 0) FROM Task t WHERE t.status = :status AND t.project.id = :projectId")
    int findMaxPositionByStatusAndProjectId(@Param("status") String status, @Param("projectId") Long projectId);

    @Query("SELECT t FROM Task t LEFT JOIN FETCH t.assignedTo")
    List<Task> findAllWithAssignedTo();

}
