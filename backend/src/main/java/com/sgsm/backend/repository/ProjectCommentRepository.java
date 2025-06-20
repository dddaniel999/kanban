package com.sgsm.backend.repository;

import com.sgsm.backend.model.ProjectComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ProjectCommentRepository extends JpaRepository<ProjectComment, Long> {
    List<ProjectComment> findByProjectIdOrderByCreatedAtDesc(Long projectId);

    List<ProjectComment> findByProjectIdAndPinnedTrueOrderByCreatedAtDesc(Long projectId);

    List<ProjectComment> findByProjectIdAndPinnedFalseOrderByCreatedAtDesc(Long projectId);

}
