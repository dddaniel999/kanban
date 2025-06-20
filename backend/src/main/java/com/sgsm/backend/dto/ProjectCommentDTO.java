package com.sgsm.backend.dto;

import java.time.LocalDateTime;

public class ProjectCommentDTO {
    private Long id;
    private String content;
    private String authorUsername;
    private LocalDateTime createdAt;
    private boolean pinned;

    public ProjectCommentDTO(Long id, String content, String authorUsername, LocalDateTime createdAt, boolean pinned) {
        this.id = id;
        this.content = content;
        this.authorUsername = authorUsername;
        this.createdAt = createdAt;
        this.pinned = pinned;
    }

    public ProjectCommentDTO(Long id, String content, String username, LocalDateTime createdAt) {
    }

    public Long getId() {
        return id;
    }

    public String getContent() {
        return content;
    }

    public String getAuthorUsername() {
        return authorUsername;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public boolean isPinned() {
        return pinned;
    }
}
