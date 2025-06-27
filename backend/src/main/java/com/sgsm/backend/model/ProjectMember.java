package com.sgsm.backend.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "project_members")
public class ProjectMember {

    @EmbeddedId
    private ProjectMemberId id;

    @MapsId("userId")
    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @MapsId("projectId")
    @ManyToOne
    @JoinColumn(name = "project_id", nullable = false)
    private Project project;

    private String role = "MEMBER"; // MEMBER sau MANAGER

    private LocalDateTime joinedAt = LocalDateTime.now();

    public ProjectMember() {}

    public ProjectMember(ProjectMemberId id, User user, Project project, String role, LocalDateTime joinedAt) {
        this.id = id;
        this.user = user;
        this.project = project;
        this.role = role;
        this.joinedAt = joinedAt;
    }

    public ProjectMember(String member) {
    }

    public ProjectMemberId getId() { return id; }
    public void setId(ProjectMemberId id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) {
        this.user = user;
        if (this.id == null) this.id = new ProjectMemberId();
        this.id.setUserId(user.getId());
    }

    public Project getProject() { return project; }
    public void setProject(Project project) {
        this.project = project;
        if (this.id == null) this.id = new ProjectMemberId();
        this.id.setProjectId(project.getId());
    }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public LocalDateTime getJoinedAt() { return joinedAt; }
    public void setJoinedAt(LocalDateTime joinedAt) { this.joinedAt = joinedAt; }
}
