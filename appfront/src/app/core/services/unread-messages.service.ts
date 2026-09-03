import { Injectable, OnDestroy, PLATFORM_ID, inject, signal, computed } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Subscription } from 'rxjs';
import { ChatRestService } from './chat-rest.service';
import { ChatSocketService } from './chat-socket.service';
import { AuthService } from '../auth/auth.service';
import { MessageToast } from '../../message/message-toast';

@Injectable({ providedIn: 'root' })
export class UnreadMessagesService implements OnDestroy {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly chatRest = inject(ChatRestService);
  private readonly chatSocket = inject(ChatSocketService);
  private readonly authService = inject(AuthService);
  private readonly toast = inject(MessageToast);

  private readonly _unreadCount = signal(0);
  readonly unreadCount = computed(() => this._unreadCount());
  readonly hasUnread = computed(() => this._unreadCount() > 0);

  private pollInterval?: ReturnType<typeof setInterval>;
  private socketSubscription?: Subscription;

  /** Start polling and WebSocket connection. Called after login. */
  startPolling(): void {
    if (!isPlatformBrowser(this.platformId)) return;
    void this.refresh();
    this.pollInterval ??= setInterval(() => void this.refresh(), 30_000);

    // Conectar WebSocket y escuchar mensajes entrantes
    this.chatSocket.connect();
    if (!this.socketSubscription) {
      this.socketSubscription = this.chatSocket.allMessages$.subscribe((message) => {
        if (!message.isMine) {
          this._unreadCount.update((c) => c + 1);
          // Si no está en la página de chat o es de otro mensaje, muestra notificación toast
          if (!window.location.pathname.includes('/chat')) {
            this.toast.toastInfo(message.senderName ?? 'Nuevo mensaje', message.content ?? '');
          }
        }
      });
    }
  }

  /** Stop polling and WebSocket connection. Called on logout. */
  stopPolling(): void {
    if (this.pollInterval !== undefined) {
      clearInterval(this.pollInterval);
      this.pollInterval = undefined;
    }
    this.socketSubscription?.unsubscribe();
    this.socketSubscription = undefined;
    this.chatSocket.disconnect();
    this._unreadCount.set(0);
  }

  /** Immediately refresh the unread count (call after sending/reading messages). */
  async refresh(): Promise<void> {
    if (!isPlatformBrowser(this.platformId)) return;
    if (!this.authService.isAuthenticated()) return;
    try {
      const conversations = await this.chatRest.getMyConversations();
      const total = conversations.reduce((sum, c) => sum + (c.unreadCount ?? 0), 0);
      this._unreadCount.set(total);
    } catch {
      // silently ignore polling errors
    }
  }

  ngOnDestroy(): void {
    this.stopPolling();
  }
}
