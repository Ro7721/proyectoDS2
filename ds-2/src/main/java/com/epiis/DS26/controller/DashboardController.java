package com.epiis.DS26.controller;

import com.epiis.DS26.business.DashboardBusiness;
import com.epiis.DS26.dto.response.DashboardResponse;
import com.epiis.DS26.message.ApiResponse;
import com.epiis.DS26.message.GenericResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping(path = "dashboard")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class DashboardController {

    private final DashboardBusiness dashboardBusiness;

    public DashboardController(DashboardBusiness dashboardBusiness) {
        this.dashboardBusiness = dashboardBusiness;
    }

    @GetMapping(path = "stats", produces = { org.springframework.http.MediaType.APPLICATION_JSON_VALUE })
    public ResponseEntity<ApiResponse<DashboardResponse>> getDashboardStats() {
        GenericResponse response = new GenericResponse();
        DashboardResponse dashboardStats = dashboardBusiness.getDashboardStats(response);

        ApiResponse<DashboardResponse> apiResponse = new ApiResponse<>();
        apiResponse.setResponse(response);
        apiResponse.setData(dashboardStats);

        return ResponseEntity.ok(apiResponse);
    }
}
