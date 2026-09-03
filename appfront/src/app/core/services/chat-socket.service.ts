import { Injectable, PLATFORM_ID, inject } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { MessageResponse } from '../../api/models/message-response';
import { AuthService } from '../auth/auth.service';

@Injectable({ providedIn: 'root' })
export class ChatSocketService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly incomingMessagesSubject = new Subject<MessageResponse>();
  private readonly connectedSubject = new BehaviorSubject(false);
  private personalSubscription?: StompSubscription;
  private readonly watchedConversationIds = new Set<string>();
  private client?: Client;

  readonly connected$ = this.connectedSubject.asObservable();
  readonly allMessages$ = this.incomingMessagesSubject.asObservable();

  connect(): void {
    if (!isPlatformBrowser(this.platformId) || this.client?.active) {
      return;
    }

    const token = this.authService.accessToken;
    if (!token) {
      return;
    }

    const wsUrl = environment.urlBase.replace(/^http/, 'ws');

    this.client = new Client({
      brokerURL: `${wsUrl}/ws-chat`,
      connectHeaders: { Authorization: `Bearer ${token}` },
      reconnectDelay: 5000,
      heartbeatIncoming: 10000,
      heartbeatOutgoing: 10000,
      debug: () => undefined,
      onConnect: () => {
        this.connectedSubject.next(true);
        this.subscribeToPersonalQueue();
      },
      onWebSocketClose: () => {
        this.connectedSubject.next(false);
        this.personalSubscription = undefined;
      },
      onStompError: () => this.connectedSubject.next(false),
    });

    this.client.activate();
  }

  watchConversation(conversationId: string): Observable<MessageResponse> {
    this.watchedConversationIds.add(conversationId);
    this.connect();

    return this.incomingMessagesSubject.pipe(
      filter((message) => message.idConversation === conversationId),
    );
  }

  unwatchConversation(conversationId: string): void {
    this.watchedConversationIds.delete(conversationId);
  }

  disconnect(): void {
    this.personalSubscription?.unsubscribe();
    this.personalSubscription = undefined;
    this.watchedConversationIds.clear();
    this.client?.deactivate();
    this.client = undefined;
    this.connectedSubject.next(false);
  }

  private parseMessage(frame: IMessage): MessageResponse {
    return JSON.parse(frame.body) as MessageResponse;
  }

  private subscribeToPersonalQueue(): void {
    if (!this.client?.connected || this.personalSubscription) return;

    this.personalSubscription = this.client.subscribe('/user/queue/messages', (frame) => {
      this.incomingMessagesSubject.next(this.parseMessage(frame));
    });
  }
}
