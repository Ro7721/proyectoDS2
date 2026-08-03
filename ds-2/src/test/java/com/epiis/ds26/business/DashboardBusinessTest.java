package com.epiis.ds26.business;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import com.epiis.ds26.dto.response.DashboardResponse;
import com.epiis.ds26.message.GenericResponse;
import com.epiis.ds26.repositorie.CourseRepo;
import com.epiis.ds26.repositorie.EnrollmentRepo;
import com.epiis.ds26.repositorie.UserRepo;

@ExtendWith(MockitoExtension.class)
class DashboardBusinessTest {

    @Mock
    private UserRepo userRepo;

    @Mock
    private CourseRepo courseRepo;

    @Mock
    private EnrollmentRepo enrollmentRepo;

    @InjectMocks
    private DashboardBusiness dashboardBusiness;

    @Test
    void getDashboardStats_returnsStats() {
        when(userRepo.count()).thenReturn(50L);
        when(courseRepo.count()).thenReturn(10L);
        when(enrollmentRepo.count()).thenReturn(20L);

        GenericResponse responseWrapper = new GenericResponse();
        DashboardResponse stats = dashboardBusiness.getDashboardStats(responseWrapper);

        assertNotNull(stats);
        assertEquals(50L, stats.getTotalUsers());
        assertEquals(10L, stats.getTotalCourses());
        assertEquals(20L, stats.getTotalEnrollments());
        assertEquals("success", responseWrapper.getType());
    }
}
