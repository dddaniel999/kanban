package com.sgsm.backend.controller;

import com.sgsm.backend.dto.TaskDTO;
import com.sgsm.backend.dto.TaskUpdateDTO;
import com.sgsm.backend.model.User;
import com.sgsm.backend.security.CustomUserDetails;
import com.sgsm.backend.service.TaskService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/tasks")
public class TaskController {

    @Autowired
    private TaskService taskService;

    @PostMapping
    public ResponseEntity<?> createTask(@RequestBody TaskDTO dto, @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        return taskService.createTask(dto, user);
    }

    @GetMapping
    public ResponseEntity<?> getTasks(
            @RequestParam(required = false) Long projectId,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        return taskService.getTasks(projectId, user);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTask(@PathVariable Long id, @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        return taskService.deleteTask(id, user);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateTask(
            @PathVariable Long id,
            @RequestBody TaskUpdateDTO dto,
            @AuthenticationPrincipal CustomUserDetails userDetails) {
        User user = userDetails.getUser();
        return taskService.updateTask(id, dto, user);
    }
}
