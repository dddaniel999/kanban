package com.sgsm.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_members")
public class ProjectMember {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    private String role = "MEMBER"; // MEMBER sau MANAGER

    private LocalDateTime joinedAt = LocalDateTime.now();

    public ProjectMember() {}

    public ProjectMember(Long id, User user, Project project, String role, LocalDateTime joinedAt) {
        this.id = id;
        this.user = user;
        this.project = project;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public ProjectMember(String member) {
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Project getProject() { return project; }
    public void setProject(Project project) { this.project = project; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
