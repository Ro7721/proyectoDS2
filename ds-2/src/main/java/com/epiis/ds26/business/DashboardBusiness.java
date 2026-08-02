package com.epiis.ds26.business;

import com.epiis.ds26.dto.response.DashboardResponse;
import com.epiis.ds26.dto.response.ChartData;
import com.epiis.ds26.message.GenericResponse;
import com.epiis.ds26.repositorie.CourseRepo;
import com.epiis.ds26.repositorie.EnrollmentRepo;
import com.epiis.ds26.repositorie.UserRepo;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class DashboardBusiness {

    private final UserRepo userRepo;
    private final CourseRepo courseRepo;
    private final EnrollmentRepo enrollmentRepo;

    public DashboardBusiness(UserRepo userRepo, CourseRepo courseRepo, EnrollmentRepo enrollmentRepo) {
        this.userRepo = userRepo;
        this.courseRepo = courseRepo;
        this.enrollmentRepo = enrollmentRepo;
    }

    public DashboardResponse getDashboardStats(GenericResponse responseWrapper) {
        DashboardResponse response = new DashboardResponse();

        long totalUsers = userRepo.count();
        long totalCourses = courseRepo.count();
        long totalEnrollments = enrollmentRepo.count();

        response.setTotalUsers(totalUsers);
        response.setTotalCourses(totalCourses);
        response.setTotalEnrollments(totalEnrollments);

        response.setTotalTeachers(10);
        response.setTotalStudents(totalUsers - 10);
        response.setActiveCourses(totalCourses);
        response.setCompletedCourses(0);
        response.setTotalIncome(0.0);

        List<ChartData> usersByRole = new ArrayList<>();
        usersByRole.add(new ChartData("ADMIN", 2));
        usersByRole.add(new ChartData("TEACHER", 10));
        usersByRole.add(new ChartData("STUDENT", totalUsers - 12));
        response.setUsersByRole(usersByRole);

        List<ChartData> coursesByCategory = new ArrayList<>();
        coursesByCategory.add(new ChartData("Desarrollo", totalCourses));
        response.setCoursesByCategory(coursesByCategory);

        List<ChartData> enrollmentsByMonth = new ArrayList<>();
        enrollmentsByMonth.add(new ChartData("Enero", 5));
        enrollmentsByMonth.add(new ChartData("Febrero", 12));
        response.setEnrollmentsByMonth(enrollmentsByMonth);

        responseWrapper.success();
        responseWrapper.getListMessage().add("EstadÃ­sticas cargadas correctamente");

        return response;
    }
}
