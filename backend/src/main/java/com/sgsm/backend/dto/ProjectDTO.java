package com.sgsm.backend.dto;

import java.util.List;
import com.sgsm.backend.model.Project;

public class ProjectDTO {

    private String title;
    private String description;
    private List<Long> memberIds;

    private Long id;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public List<Long> getMemberIds() { return memberIds; }
    public void setMemberIds(List<Long> memberIds) { this.memberIds = memberIds; }

    public Long getId(){
        return id;
    }
    public void setId(Long id) {
        this.id=id;
    }

    public ProjectDTO(Project project) {
        this.id = project.getId();
        this.title = project.getTitle();
        this.description = project.getDescription();
    }

    public ProjectDTO(Long id,String title, String description) {
        this.title = title;
        this.description = description;
        this.id = id;
    }

    public ProjectDTO() {

    }
}
