export interface TeacherEnrollmentResponse {
    idEnrollment: string;
    idStudent: string;
    studentFullName: string;
    studentEmail: string;
    idCourse: string;
    courseTitle: string;
    courseImage: string;
    totalProgress: number;
    completed: boolean;
    enrollmentDate: string;
    lastAccess: string;
}