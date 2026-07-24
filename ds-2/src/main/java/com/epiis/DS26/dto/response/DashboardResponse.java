package com.epiis.DS26.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DashboardResponse {
    private long totalUsers;
    private long totalTeachers;
    private long totalStudents;
    private long totalCourses;
    private long totalEnrollments;
    private long activeCourses;
    private long completedCourses;
    private double totalIncome;

    private List<ChartData> usersByRole;
    private List<ChartData> coursesByCategory;
    private List<ChartData> enrollmentsByMonth;
}
