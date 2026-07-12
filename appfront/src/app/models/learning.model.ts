export interface LessonFileResponse {
    idFile: string;
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileOrder: number;
}

export interface LessonContentResponse {
    idLesson: string;
    title: string;
    description: string;
    type: string;
    contentUrl: string;
    durationMinutes: number;
    lessonOrder: number;
    isFree: boolean;
    files: LessonFileResponse[];
}

export interface CourseContentResponse {
    idCourse: string;
    title: string;
    description: string;
    coverImage: string;
    teacherFullName: string;
    categoryName: string;
    totalLessons: number;
    totalProgress: number;
    completed: boolean;
    lastAccess: string;
    lessons: LessonContentResponse[];
}

// ---- Nuevas interfaces para el guardado de progreso ----

export interface LessonProgressRequest {
    idLesson: string;
    watchedPercentage: number;
    lastPositionSeconds: number;
}

export interface CourseProgressResponse {
    idLesson: string;
    lessonCompleted: boolean;
    watchedPercentage: number;
    lastPositionSeconds: number;
    totalProgress: number;
    courseCompleted: boolean;
}