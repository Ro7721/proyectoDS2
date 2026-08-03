package com.epiis.ds26.controller;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import com.epiis.ds26.business.DashboardBusiness;
import com.epiis.ds26.dto.response.DashboardResponse;
import com.epiis.ds26.message.ApiResponse;
import com.epiis.ds26.message.GenericResponse;

@ExtendWith(MockitoExtension.class)
class DashboardControllerTest {

    @Mock
    private DashboardBusiness dashboardBusiness;

    @InjectMocks
    private DashboardController dashboardController;

    @Test
    void getDashboardStats_success() {
        DashboardResponse stats = new DashboardResponse();
        when(dashboardBusiness.getDashboardStats(any(GenericResponse.class))).thenReturn(stats);

        ResponseEntity<ApiResponse<DashboardResponse>> response = dashboardController.getDashboardStats();

        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertEquals(stats, response.getBody().getData());
    }
}
