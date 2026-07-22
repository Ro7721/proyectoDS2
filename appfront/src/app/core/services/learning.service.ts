import { Injectable } from '@angular/core';
import { Api } from '../../api/api';
import { CourseContentResponse } from '../../models/learning.model';
import { getCourseContent, saveProgress } from '../../api/functions';
import { LessonProgressEvent } from '../../features/student/course/learning-course/learning-course';

@Injectable({
  providedIn: 'root',
})
export class LearningService {
  constructor(private api: Api) { }

  async getCourseContent(idCourse: string): Promise<CourseContentResponse> {
    const response: any = await this.api.invoke(getCourseContent, { idCourse: idCourse });
    return (response.data ?? response) as CourseContentResponse;
  }

  async saveProgress(event: LessonProgressEvent): Promise<void> {
    await this.api.invoke(saveProgress, {
      body: event
    });
  }
}
