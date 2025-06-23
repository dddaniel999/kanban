package com.sgsm.backend.service;

import com.sgsm.backend.dto.ProjectCommentDTO;
import com.sgsm.backend.dto.ProjectCommentRequestDTO;
import com.sgsm.backend.model.Project;
import com.sgsm.backend.model.ProjectComment;
import com.sgsm.backend.model.User;
import com.sgsm.backend.repository.ProjectCommentRepository;
import com.sgsm.backend.repository.ProjectRepository;
import com.sgsm.backend.repository.ProjectMemberRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProjectCommentService {

    @Autowired private ProjectCommentRepository commentRepository;
    @Autowired private ProjectRepository projectRepository;
    @Autowired private ProjectMemberRepository projectMemberRepository;
    @Autowired private PermissionService permissionService;

    public ResponseEntity<?> addComment(Long projectId, ProjectCommentRequestDTO dto, User user) {
        Optional<Project> optionalProject = projectRepository.findById(projectId);
        if (optionalProject.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ProjectComment comment = new ProjectComment();
        comment.setContent(dto.getContent());
        comment.setAuthor(user);
        comment.setProject(optionalProject.get());
        comment.setCreatedAt(LocalDateTime.now());

        ProjectComment saved = commentRepository.save(comment);

        ProjectCommentDTO responseDto = new ProjectCommentDTO(
                saved.getId(),
                saved.getContent(),
                saved.getAuthor().getUsername(),
                saved.getCreatedAt()
        );

        return ResponseEntity.ok(responseDto);
    }

    public ResponseEntity<?> deleteComment(Long projectId, Long commentId, User user) {
        Optional<ProjectComment> optionalComment = commentRepository.findById(commentId);
        if (optionalComment.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        ProjectComment comment = optionalComment.get();

        if (!comment.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().body("Comentariul nu aparține proiectului");
        }

        boolean isAuthor = comment.getAuthor().getId().equals(user.getId());
        boolean isAdmin = permissionService.isAdmin(user);

        if (!isAuthor && !isAdmin) {
            return ResponseEntity.status(403).body("Nu ai permisiunea să ștergi comentariul");
        }

        commentRepository.delete(comment);
        return ResponseEntity.ok().build();
    }

    public ResponseEntity<?> getAllComments(Long projectId) {
        List<ProjectComment> allComments = commentRepository.findByProjectIdOrderByCreatedAtDesc(projectId);

        List<ProjectCommentDTO> pinned = allComments.stream()
                .filter(ProjectComment::isPinned)
                .map(c -> new ProjectCommentDTO(
                        c.getId(),
                        c.getContent(),
                        c.getAuthor().getUsername(),
                        c.getCreatedAt(),
                        true
                ))
                .collect(Collectors.toList());

        List<ProjectCommentDTO> unpinned = allComments.stream()
                .filter(c -> !c.isPinned())
                .map(c -> new ProjectCommentDTO(
                        c.getId(),
                        c.getContent(),
                        c.getAuthor().getUsername(),
                        c.getCreatedAt(),
                        false
                ))
                .collect(Collectors.toList());

        return ResponseEntity.ok(Map.of(
                "pinned", pinned,
                "unpinned", unpinned
        ));
    }

    @Transactional
    public ResponseEntity<?> togglePin(Long projectId, Long commentId, User user) {
        ProjectComment comment = commentRepository.findById(commentId)
                .orElseThrow(() -> new RuntimeException("Not found"));

        if (!comment.getProject().getId().equals(projectId)) {
            return ResponseEntity.badRequest().body("Comentariul nu aparține proiectului");
        }

        boolean isManager = permissionService.isManagerOfProject(user, projectId, projectMemberRepository);
        boolean isAdmin = permissionService.isAdmin(user);

        if (!isManager && !isAdmin) {
            return ResponseEntity.status(403).body("Nu ai permisiunea să faci această acțiune");
        }

        comment.setPinned(!comment.isPinned());
        commentRepository.save(comment);
        return ResponseEntity.ok().build();
    }
}