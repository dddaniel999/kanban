package com.sgsm.backend.service;

import com.sgsm.backend.dto.ProjectDTO;
import com.sgsm.backend.dto.TaskDTO;
import com.sgsm.backend.model.Project;
import com.sgsm.backend.model.Task;
import com.sgsm.backend.repository.ProjectRepository;
import com.sgsm.backend.repository.TaskRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class AdminService {

    @Autowired
    private ProjectRepository projectRepository;

    @Autowired
    private TaskRepository taskRepository;

    public List<ProjectDTO> getAllProjects() {
        return projectRepository.findAll().stream()
                .map(p -> new ProjectDTO(p.getId(), p.getTitle(), p.getDescription()))
                .collect(Collectors.toList());
    }

    public List<TaskDTO> getAllTasks() {
        return taskRepository.findAll().stream()
                .map(TaskDTO::new)
                .collect(Collectors.toList());
    }
}
