package com.sgsm.backend.service;

import com.sgsm.backend.dto.ProjectDTO;
import com.sgsm.backend.model.Project;
import com.sgsm.backend.model.ProjectMember;
import com.sgsm.backend.model.User;
import com.sgsm.backend.repository.ProjectMemberRepository;
import com.sgsm.backend.repository.ProjectRepository;
import com.sgsm.backend.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.*;
import org.springframework.http.ResponseEntity;

import java.util.List;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class ProjectServiceTest {

    @InjectMocks
    private ProjectService projectService;

    @Mock
    private ProjectRepository projectRepository;
    @Mock
    private ProjectMemberRepository projectMemberRepository;
    @Mock
    private UserRepository userRepository;

    @BeforeEach
    void setUp() {
        MockitoAnnotations.openMocks(this);
    }

    @Test
    void testCreateProject_success() {
        // Arrange
        User manager = new User();
        manager.setId(1L);
        manager.setUsername("manager");

        ProjectDTO dto = new ProjectDTO();
        dto.setTitle("Test Project");
        dto.setDescription("Description");
        dto.setMemberIds(List.of(2L)); // alt user

        Project savedProject = new Project("Test Project", "Description");
        savedProject.setId(100L);

        User otherUser = new User();
        otherUser.setId(2L);
        otherUser.setUsername("member");

        when(projectRepository.save(any(Project.class))).thenReturn(savedProject);
        when(userRepository.findById(2L)).thenReturn(java.util.Optional.of(otherUser));

        // Act
        ResponseEntity<?> response = projectService.createProject(dto, manager);

        // Assert
        assertEquals(200, response.getStatusCodeValue());
        verify(projectRepository, times(1)).save(any(Project.class));
        verify(projectMemberRepository, times(2)).save(any(ProjectMember.class)); // manager + member
    }
}
