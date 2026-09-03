import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Api } from '../../api/api';
import {
  getMessagesByConversation,
  getMyConversations,
  getOrCreateConversation,
  getMyCourses,
  findByTeacher,
  markConversationAsRead,
  sendMessage,
} from '../../api/functions';
import { ConversationSummaryResponse } from '../../api/models/conversation-summary-response';
import { CreateConversationRequest } from '../../api/models/create-conversation-request';
import { MessageResponse } from '../../api/models/message-response';
import { SendMessageRequest } from '../../api/models/send-message-request';
import { UserResponse } from '../../api/models/user-response';
import { CourseResponse } from '../../api/models/course-response';
import { MyCourseResponse } from '../../api/models/my-course-response';
import { environment } from '../../environments/environment';
import { unwrapApiResponse } from '../utils/api-response';

@Injectable({ providedIn: 'root' })
export class ChatRestService {
  private readonly api = inject(Api);
  private readonly http = inject(HttpClient);

  async getMyConversations(): Promise<ConversationSummaryResponse[]> {
    const response = await this.api.invoke(getMyConversations, {});
    return unwrapApiResponse<ConversationSummaryResponse[]>(response) ?? [];
  }

  async getOrCreateConversation(request: CreateConversationRequest): Promise<ConversationSummaryResponse> {
    const response = await this.api.invoke(getOrCreateConversation, { body: request });
    return unwrapApiResponse<ConversationSummaryResponse>(response);
  }

  async getMessages(conversationId: string): Promise<MessageResponse[]> {
    const response = await this.api.invoke(getMessagesByConversation, { conversationId });
    return unwrapApiResponse<MessageResponse[]>(response) ?? [];
  }

  async sendMessage(request: SendMessageRequest): Promise<MessageResponse> {
    const response = await this.api.invoke(sendMessage, { body: request });
    return unwrapApiResponse<MessageResponse>(response);
  }

  async markAsRead(conversationId: string): Promise<void> {
    await this.api.invoke(markConversationAsRead, { conversationId });
  }

  async getRecipients(currentUserId?: string): Promise<UserResponse[]> {
    const users = await firstValueFrom(this.http.get<UserResponse[]>(`${environment.urlBase}/users/list`));
    return users.filter((user) => user.active !== false && user.idUser !== currentUserId);
  }

  async getCoursesForUser(userId: string | undefined, role: string | null): Promise<Array<Pick<CourseResponse, 'idCourse' | 'title' | 'teacherFullName'>>> {
    if (role === 'ROLE_STUDENT') {
      const response = await this.api.invoke(getMyCourses, {});
      return (response as MyCourseResponse[]).map((course) => ({
        idCourse: course.idCourse,
        title: course.title,
        teacherFullName: course.teacherFullName,
      }));
    }

    if (role === 'ROLE_TEACHER' && userId) {
      const response = await this.api.invoke(findByTeacher, { teacherId: userId });
      return unwrapApiResponse<CourseResponse[]>(response) ?? [];
    }

    return firstValueFrom(this.http.get<CourseResponse[]>(`${environment.urlBase}/courses/list`));
  }
}
