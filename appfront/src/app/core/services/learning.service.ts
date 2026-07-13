import { Injectable } from '@angular/core';
import { Api } from '../../api/api';
import { CourseContentResponse } from '../../models/learning.model';
import { apiCourseContent, apiSaveProgress } from '../../api/functions';
import { LessonProgressEvent } from '../../features/student/course/learning-course/learning-course';

@Injectable({
  providedIn: 'root',
})
export class LearningService {
  constructor(private api: Api) { }

  async getCourseContent(idCourse: string): Promise<CourseContentResponse> {
    const response: any = await this.api.invoke(apiCourseContent, { idCourse });
    return response.data ?? response;
  }

  async saveProgress(event: LessonProgressEvent): Promise<void> {
    const response: any = await this.api.invoke(apiSaveProgress, {
      body: event
    });
    return response.data ?? response;
  }
}
