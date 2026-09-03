import { CommonModule, DatePipe, isPlatformBrowser } from '@angular/common';
import { AfterViewChecked, Component, ElementRef, OnDestroy, OnInit, PLATFORM_ID, ViewChild, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Subscription } from 'rxjs';
import { ChatRestService } from '../../../core/services/chat-rest.service';
import { ChatSocketService } from '../../../core/services/chat-socket.service';
import { ConversationSummaryResponse } from '../../../api/models/conversation-summary-response';
import { MessageResponse } from '../../../api/models/message-response';
import { MessageToast } from '../../../message/message-toast';
import { AuthService } from '../../../core/auth/auth.service';
import { UserResponse } from '../../../api/models/user-response';
import { CourseResponse } from '../../../api/models/course-response';
import { UnreadMessagesService } from '../../../core/services/unread-messages.service';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [CommonModule, FormsModule, DatePipe],
  templateUrl: './chat.component.html',
})
export class ChatComponent implements OnInit, OnDestroy, AfterViewChecked {
  @ViewChild('messagesContainer') private messagesContainer?: ElementRef<HTMLElement>;

  private readonly platformId = inject(PLATFORM_ID);
  private readonly chatRest = inject(ChatRestService);
  private readonly chatSocket = inject(ChatSocketService);
  private readonly toast = inject(MessageToast);
  private readonly authService = inject(AuthService);
  private readonly unreadMessages = inject(UnreadMessagesService);
  private socketSubscription?: Subscription;
  private globalSocketSubscription?: Subscription;
  private shouldScrollToBottom = false;

  readonly conversations = signal<ConversationSummaryResponse[]>([]);
  readonly selectedConversation = signal<ConversationSummaryResponse | null>(null);
  readonly messages = signal<MessageResponse[]>([]);
  readonly draft = signal('');
  readonly attachmentName = signal<string | null>(null);
  readonly loadingConversations = signal(true);
  readonly loadingMessages = signal(false);
  readonly sending = signal(false);
  readonly newConversationOpen = signal(false);
  readonly startingConversation = signal(false);
  readonly recipients = signal<UserResponse[]>([]);
  readonly availableCourses = signal<Array<Pick<CourseResponse, 'idCourse' | 'title' | 'teacherFullName'>>>([]);
  readonly recipientSearch = signal('');
  readonly selectedRecipientId = signal<string | null>(null);
  readonly conversationType = signal<'DIRECT' | 'COURSE_SUPPORT'>('DIRECT');
  readonly selectedCourseId = signal<string | null>(null);
  readonly loadingNewConversationData = signal(false);
  readonly filteredRecipients = computed(() => {
    const query = this.recipientSearch().trim().toLowerCase();
    if (!query) return this.recipients();
    return this.recipients().filter((user) => `${user.firstName ?? ''} ${user.surName ?? ''} ${user.email ?? ''}`.toLowerCase().includes(query));
  });

  constructor() {}

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      void this.loadConversations();

      // Conectar WebSocket y escuchar todos los mensajes entrantes para notificaciones y preview
      this.chatSocket.connect();
      this.globalSocketSubscription = this.chatSocket.allMessages$.subscribe((message) => {
        this.updateConversationPreview(message);

        // Si el mensaje es de otra conversación y no es propio, mostrar Toast de notificación
        const currentSelectedId = this.selectedConversation()?.conversationId;
        if (!message.isMine && message.idConversation !== currentSelectedId) {
          this.toast.toastInfo(message.senderName ?? 'Nuevo mensaje', message.content ?? '');
          void this.unreadMessages.refresh();
        }
      });
    }
  }

  async loadConversations(): Promise<void> {
    this.loadingConversations.set(true);
    try {
      this.conversations.set(await this.chatRest.getMyConversations());
    } catch {
      this.toast.toastError('Mensajes', 'No se pudo cargar la bandeja de entrada.');
    } finally {
      this.loadingConversations.set(false);
    }
  }

  async selectConversation(conversation: ConversationSummaryResponse): Promise<void> {
    const conversationId = conversation.conversationId;
    if (!conversationId) return;

    this.socketSubscription?.unsubscribe();
    const previousId = this.selectedConversation()?.conversationId;
    if (previousId && previousId !== conversationId) this.chatSocket.unwatchConversation(previousId);

    this.selectedConversation.set({ ...conversation, unreadCount: 0 });
    this.conversations.update((items) => items.map((item) =>
      item.conversationId === conversationId ? { ...item, unreadCount: 0 } : item,
    ));
    this.messages.set([]);
    this.loadingMessages.set(true);

    try {
      const [messages] = await Promise.all([
        this.chatRest.getMessages(conversationId),
        this.chatRest.markAsRead(conversationId),
      ]);
      this.messages.set(messages);
      this.requestScroll();
      // Refresh bell badge after reading
      void this.unreadMessages.refresh();
      this.socketSubscription = this.chatSocket.watchConversation(conversationId).subscribe((message) => {
        this.addMessage(message);
        if (!message.isMine) void this.chatRest.markAsRead(conversationId);
      });
    } catch {
      this.toast.toastError('Mensajes', 'No se pudo cargar esta conversación.');
    } finally {
      this.loadingMessages.set(false);
    }
  }

  async openNewConversation(): Promise<void> {
    this.newConversationOpen.set(true);
    this.recipientSearch.set('');
    this.selectedRecipientId.set(null);
    this.selectedCourseId.set(null);
    this.conversationType.set('DIRECT');
    this.loadingNewConversationData.set(true);
    try {
      const currentUser = this.authService.user;
      const [recipients, courses] = await Promise.all([
        this.chatRest.getRecipients(currentUser?.idUser),
        this.chatRest.getCoursesForUser(currentUser?.idUser, this.authService.currentRole),
      ]);
      this.recipients.set(recipients);
      this.availableCourses.set(courses);
    } catch {
      this.toast.toastError('Nuevo chat', 'No se pudieron cargar los destinatarios o cursos.');
    } finally {
      this.loadingNewConversationData.set(false);
    }
  }

  closeNewConversation(): void {
    if (!this.startingConversation()) this.newConversationOpen.set(false);
  }

  selectRecipient(recipientId?: string): void {
    if (recipientId) this.selectedRecipientId.set(recipientId);
  }

  async createConversation(): Promise<void> {
    const recipientId = this.selectedRecipientId();
    const type = this.conversationType();
    const courseId = this.selectedCourseId();
    if (!recipientId) {
      this.toast.toastWarn('Selecciona un destinatario', 'Elige con quién deseas conversar.');
      return;
    }
    if (type === 'COURSE_SUPPORT' && !courseId) {
      this.toast.toastWarn('Selecciona un curso', 'El soporte debe estar asociado a un curso.');
      return;
    }

    this.startingConversation.set(true);
    try {
      const conversation = await this.chatRest.getOrCreateConversation({
        recipientId,
        type,
        courseId: type === 'COURSE_SUPPORT' ? courseId ?? undefined : undefined,
      });
      this.conversations.update((items) => {
        const exists = items.some((item) => item.conversationId === conversation.conversationId);
        return exists
          ? items.map((item) => item.conversationId === conversation.conversationId ? { ...item, ...conversation } : item)
          : [conversation, ...items];
      });
      this.newConversationOpen.set(false);
      await this.selectConversation(conversation);
    } catch {
      this.toast.toastError('Nuevo chat', 'No fue posible crear la conversación.');
    } finally {
      this.startingConversation.set(false);
    }
  }

  async send(): Promise<void> {
    const conversationId = this.selectedConversation()?.conversationId;
    const content = this.draft().trim();
    if (!conversationId || !content || this.sending()) return;

    // Limpiar input y adjuntos instantáneamente (0ms de retraso percibido)
    this.draft.set('');
    this.attachmentName.set(null);
    this.sending.set(true);

    const tempId = `temp-${Date.now()}`;
    const currentUser = this.authService.user;
    const optimisticMessage: MessageResponse = {
      idMessage: tempId,
      idConversation: conversationId,
      senderId: currentUser?.idUser,
      senderName: `${currentUser?.firstName ?? ''} ${currentUser?.surName ?? ''}`.trim(),
      content: content,
      sentAt: new Date().toISOString(),
      isMine: true,
    };

    // Renderizar mensaje optimista inmediatamente en la interfaz
    this.addMessage(optimisticMessage);

    try {
      const realMessage = await this.chatRest.sendMessage({ conversationId, content });
      if (realMessage) {
        this.addMessage(realMessage);
      }
    } catch {
      // Revertir mensaje si falla la red
      this.messages.update((items) => items.filter((item) => item.idMessage !== tempId));
      this.draft.set(content);
      this.toast.toastError('Mensaje no enviado', 'Inténtalo nuevamente.');
    } finally {
      this.sending.set(false);
    }
  }

  onComposerKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      void this.send();
    }
  }

  onAttachmentSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    this.attachmentName.set(file?.name ?? null);
  }

  initials(conversation: ConversationSummaryResponse): string {
    const recipient = conversation.recipient;
    return `${recipient?.firstName?.[0] ?? ''}${recipient?.surName?.[0] ?? ''}`.toUpperCase() || '?';
  }

  recipientName(conversation: ConversationSummaryResponse | null): string {
    if (!conversation) return '';
    return `${conversation.recipient?.firstName ?? ''} ${conversation.recipient?.surName ?? ''}`.trim() || 'Usuario';
  }

  roleLabel(role?: string): string {
    return role === 'ROLE_TEACHER' ? 'Docente' : role === 'ROLE_STUDENT' ? 'Alumno' : 'Administrador';
  }

  relativeDate(value?: string): string {
    if (!value) return '';
    const diff = Date.now() - new Date(value).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return 'Ahora';
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours} h`;
    const days = Math.floor(hours / 24);
    return days === 1 ? 'Ayer' : `${days} días`;
  }

  trackConversation(_: number, conversation: ConversationSummaryResponse): string {
    return conversation.conversationId ?? '';
  }

  trackMessage(_: number, message: MessageResponse): string {
    return message.idMessage ?? `${message.senderId}-${message.sentAt}`;
  }

  ngAfterViewChecked(): void {
    if (!this.shouldScrollToBottom) return;
    this.shouldScrollToBottom = false;
    const container = this.messagesContainer?.nativeElement;
    if (container) container.scrollTop = container.scrollHeight;
  }

  ngOnDestroy(): void {
    this.socketSubscription?.unsubscribe();
    this.globalSocketSubscription?.unsubscribe();
    const conversationId = this.selectedConversation()?.conversationId;
    if (conversationId) this.chatSocket.unwatchConversation(conversationId);
  }

  private addMessage(message: MessageResponse): void {
    this.messages.update((items) => {
      // Si el mensaje definitivo ya existe en la lista, no hacer nada
      if (items.some((item) => item.idMessage === message.idMessage)) {
        return items;
      }
      // Si es un mensaje definitivo enviado por el usuario actual, reemplazar el mensaje optimista (temp-*)
      const tempIndex = items.findIndex(
        (item) => item.idMessage?.startsWith('temp-') && item.content === message.content && (message.isMine || item.isMine),
      );
      if (tempIndex !== -1) {
        const updated = [...items];
        updated[tempIndex] = message;
        return updated;
      }
      return [...items, message];
    });
    this.updateConversationPreview(message);
    this.requestScroll();
  }

  private updateConversationPreview(message: MessageResponse): void {
    this.conversations.update((items) => items
      .map((item) => item.conversationId === message.idConversation
        ? {
            ...item,
            lastMessageContent: message.content,
            lastMessageSentAt: message.sentAt,
            updatedAt: message.sentAt,
            unreadCount: item.conversationId === this.selectedConversation()?.conversationId || message.isMine
              ? 0
              : (item.unreadCount ?? 0) + 1,
          }
        : item)
      .sort((a, b) => new Date(b.updatedAt ?? 0).getTime() - new Date(a.updatedAt ?? 0).getTime()),
    );
  }

  private requestScroll(): void {
    this.shouldScrollToBottom = true;
  }
}
