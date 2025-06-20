package com.sgsm.backend.service;

import com.sgsm.backend.dto.TaskDTO;
import com.sgsm.backend.dto.TaskUpdateDTO;
import com.sgsm.backend.model.*;
import com.sgsm.backend.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;

import java.time.LocalDateTime;
import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class TaskServiceTest {

    @Mock private TaskRepository taskRepository;
    @Mock private ProjectRepository projectRepository;
    @Mock private UserRepository userRepository;
    @Mock private ProjectMemberRepository projectMemberRepository;

    @InjectMocks private TaskService taskService;

    private User manager;
    private Project project;
    private TaskDTO validTaskDTO;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);

        manager = new User();
        manager.setId(1L);
        manager.setUsername("manager");

        project = new Project();
        project.setId(100L);
        project.setTitle("Test Project");

        validTaskDTO = new TaskDTO();
        validTaskDTO.setProjectId(project.getId());
        validTaskDTO.setAssignedToId(2L);
        validTaskDTO.setTitle("Task");
        validTaskDTO.setDescription("Desc");
        validTaskDTO.setStatus("TO_DO");
        validTaskDTO.setDeadline(LocalDateTime.now().plusDays(1));
    }

    private ProjectMember mockRelation(User user, Project project, String role) {
        ProjectMember pm = new ProjectMember();
        pm.setUser(user);
        pm.setProject(project);
        pm.setRole(role);
        return pm;
    }

    @Test
    void createTask_userNotManager_returns403() {
        ProjectMember relation = mockRelation(manager, project, "MEMBER");
        when(projectMemberRepository.findByUserIdAndProjectId(1L, 100L)).thenReturn(Optional.of(relation));

        ResponseEntity<?> response = taskService.createTask(validTaskDTO, manager);

        assertEquals(403, response.getStatusCodeValue());
    }

    @Test
    void createTask_assignedUserNotInProject_returns400() {
        ProjectMember relation = mockRelation(manager, project, "MANAGER");

        when(projectMemberRepository.findByUserIdAndProjectId(1L, 100L)).thenReturn(Optional.of(relation));
        when(projectMemberRepository.existsByUserIdAndProjectId(2L, 100L)).thenReturn(false);

        ResponseEntity<?> response = taskService.createTask(validTaskDTO, manager);

        assertEquals(400, response.getStatusCodeValue());
    }

    @Test
    void createTask_successful_returns200() {
        ProjectMember relation = mockRelation(manager, project, "MANAGER");

        User assignedUser = new User();
        assignedUser.setId(2L);
        assignedUser.setUsername("assigned");

        when(projectMemberRepository.findByUserIdAndProjectId(1L, 100L)).thenReturn(Optional.of(relation));
        when(projectMemberRepository.existsByUserIdAndProjectId(2L, 100L)).thenReturn(true);
        when(projectRepository.findById(100L)).thenReturn(Optional.of(project));
        when(userRepository.findById(2L)).thenReturn(Optional.of(assignedUser));
        when(taskRepository.findMaxPositionByStatusAndProjectId("TO_DO", 100L)).thenReturn(0);
        when(taskRepository.save(any(Task.class))).thenAnswer(i -> i.getArguments()[0]);

        ResponseEntity<?> response = taskService.createTask(validTaskDTO, manager);

        assertEquals(200, response.getStatusCodeValue());
        Task created = (Task) response.getBody();
        assertNotNull(created);
        assertEquals("Task", created.getTitle());
        assertEquals("TO_DO", created.getStatus());
        assertEquals(assignedUser, created.getAssignedTo());
        assertEquals(1, created.getPosition());
    }

    @Test
    void deleteTask_notManager_returns403() {
        Task task = new Task();
        task.setId(1L);
        task.setProject(project);

        ProjectMember relation = mockRelation(manager, project, "MEMBER");

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(projectMemberRepository.findByUserIdAndProjectId(1L, 100L)).thenReturn(Optional.of(relation));

        ResponseEntity<?> response = taskService.deleteTask(1L, manager);

        assertEquals(403, response.getStatusCodeValue());
    }

    @Test
    void deleteTask_success_returns200() {
        Task task = new Task();
        task.setId(1L);
        task.setProject(project);

        ProjectMember relation = mockRelation(manager, project, "MANAGER");

        when(taskRepository.findById(1L)).thenReturn(Optional.of(task));
        when(projectMemberRepository.findByUserIdAndProjectId(1L, 100L)).thenReturn(Optional.of(relation));

        ResponseEntity<?> response = taskService.deleteTask(1L, manager);

        assertEquals(200, response.getStatusCodeValue());
        verify(taskRepository).delete(task);
    }
}
