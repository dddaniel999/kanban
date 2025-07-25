package com.sgsm.backend.dto;

import com.sgsm.backend.model.Task;

import java.time.LocalDateTime;

public class TaskDTO {

    private Long id;
    private String title;
    private String description;
    private String status;
    private String tags;
    private LocalDateTime deadline;
    private Long projectId;
    private Long assignedToId;
    private String assignedToUsername;
    private Integer position;


    public TaskDTO() {}

    public Integer getPosition() {
        return position;
    }

    public void setPosition(Integer position) {
        this.position = position;
    }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }

    public String getTags() { return tags; }
    public void setTags(String tags) { this.tags = tags; }

    public LocalDateTime getDeadline() { return deadline; }
    public void setDeadline(LocalDateTime deadline) { this.deadline = deadline; }

    public Long getProjectId() { return projectId; }
    public void setProjectId(Long projectId) { this.projectId = projectId; }

    public Long getAssignedToId() { return assignedToId; }
    public void setAssignedToId(Long assignedToId) { this.assignedToId = assignedToId; }
    public String getAssignedToUsername() { return assignedToUsername; }
    public void setAssignedToUsername(String assignedToUsername) { this.assignedToUsername = assignedToUsername; }

    public TaskDTO(Task task) {
        this.id = task.getId();
        this.title = task.getTitle();
        this.description = task.getDescription();
        this.status = task.getStatus();
        this.tags = task.getTags();
        this.deadline = task.getDeadline();
        this.projectId = task.getProject().getId();
        this.position = task.getPosition();
        if (task.getAssignedTo() != null) {
            this.assignedToId = task.getAssignedTo().getId();
            this.assignedToUsername = task.getAssignedTo().getUsername();
        }
    }
}
