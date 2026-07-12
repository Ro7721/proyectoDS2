export interface MyCourseResponse {
    idEnrollment: string
    idCourse: string
    title: string
    description: string
    coverImage: string
    teacherFullName: string
    categoryName: string
    totalLessons: number
    totalProgress: number
    completed: boolean
    lastAccess: string
}