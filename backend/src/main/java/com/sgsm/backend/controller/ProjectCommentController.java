package com.sgsm.backend.controller;

import com.sgsm.backend.dto.ProjectCommentDTO;
import com.sgsm.backend.dto.ProjectCommentRequestDTO;
import com.sgsm.backend.model.Project;
import com.sgsm.backend.model.ProjectComment;
import com.sgsm.backend.model.User;
import com.sgsm.backend.repository.ProjectCommentRepository;
import com.sgsm.backend.repository.ProjectRepository;
import com.sgsm.backend.security.CustomUserDetails;
import com.sgsm.backend.service.ProjectCommentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/projects/{projectId}/comments")
public class ProjectCommentController {

    @Autowired
    private ProjectCommentService commentService;

    @PostMapping
    public ResponseEntity<?> addComment(
            @PathVariable Long projectId,
            @RequestBody ProjectCommentRequestDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return commentService.addComment(projectId, dto, userDetails.getUser());
    }

    @DeleteMapping("/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable Long projectId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return commentService.deleteComment(projectId, commentId, userDetails.getUser());
    }

    @GetMapping
    public ResponseEntity<?> getAllComments(@PathVariable Long projectId) {
        return commentService.getAllComments(projectId);
    }

    @PatchMapping("/{commentId}/pin")
    public ResponseEntity<?> togglePinComment(
            @PathVariable Long projectId,
            @PathVariable Long commentId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        return commentService.togglePin(projectId, commentId, userDetails.getUser());
    }
}






