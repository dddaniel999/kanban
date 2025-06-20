package com.sgsm.backend.controller;

import com.sgsm.backend.dto.DashboardDTO;
import com.sgsm.backend.dto.ManagerDashboardDTO;
import com.sgsm.backend.security.CustomUserDetails;
import com.sgsm.backend.service.DashboardService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/dashboard")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return dashboardService.getDashboardForUser(userDetails.getUser());
    }

    @GetMapping("/manager")
    public ResponseEntity<ManagerDashboardDTO> getManagerDashboard(@AuthenticationPrincipal CustomUserDetails userDetails) {
        return dashboardService.getDashboardForManager(userDetails.getUser());
    }
}
