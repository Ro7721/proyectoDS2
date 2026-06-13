export interface FileResponse {
    idFile: string;
    fileName: string;
    fileUrl: string;
    fileType: string; // O un enum si prefieres (EType)
    fileOrder: number;
}

export interface LessonResponse {
    idLesson: string;
    title: string;
    description: string;
    type: string;
    contentUrl: string;
    durationMinutes: number;
    lessonOrder: number;
    isFree: boolean;
    files: FileResponse[];
}

export interface CourseResponse {
    idCourse: string;
    title: string;
    description: string;
    coverImage: string;
    level: string;
    price: number;
    status: string;
    teacherFullName?: string;
    categoryName: string;
    totalLessons: number;
    lessons: LessonResponse[];
}

export type CourseCardResponse = Omit<CourseResponse, 'lessons'> & {
    teacherFullName: string;
};
