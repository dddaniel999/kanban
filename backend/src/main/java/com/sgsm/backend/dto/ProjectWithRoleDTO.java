package com.sgsm.backend.dto;

public class ProjectWithRoleDTO {
    private Long id;
    private String title;
    private String description;
    private String role;

    public ProjectWithRoleDTO(Long id, String title, String description, String role) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.role = role;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
}
