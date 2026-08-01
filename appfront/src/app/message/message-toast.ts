import { Injectable } from '@angular/core';

import { MessageService } from 'primeng/api';
import { getApiMessage } from '../core/utils/api-response';
@Injectable({
  providedIn: 'root',
})
export class MessageToast {

  constructor(private messageService: MessageService) { }
  toastSuccess(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'success',
      summary,
      detail: detail ?? '',
      life: 4000,
    });
  }

  toastError(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'error',
      summary,
      detail: detail ?? '',
      life: 5000,
    });
  }

  toastWarn(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'warn',
      summary,
      detail: detail ?? '',
      life: 4500,
    });
  }
  toastInfo(summary: string, detail?: string): void {
    this.messageService.add({
      severity: 'info',
      summary,
      detail: detail ?? '',
      life: 4000,
    });
  }

  toastApiError(error: unknown, summary = 'No se pudo completar la operación'): void {
    const detail = error instanceof Error
      ? error.message
      : getApiMessage(error, 'Intenta nuevamente en unos segundos.');

    this.toastError(summary, detail);
  }

}
