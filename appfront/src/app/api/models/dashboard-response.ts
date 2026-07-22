export interface ChartData {
  label: string;
  value: number;
}

export interface DashboardResponse {
  totalUsers?: number;
  totalTeachers?: number;
  totalStudents?: number;
  totalCourses?: number;
  totalEnrollments?: number;
  activeCourses?: number;
  completedCourses?: number;
  totalIncome?: number;
  usersByRole?: ChartData[];
  coursesByCategory?: ChartData[];
  enrollmentsByMonth?: ChartData[];
}
