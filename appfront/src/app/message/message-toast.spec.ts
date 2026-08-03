import 'zone.js';
import 'zone.js/testing';
import { TestBed } from '@angular/core/testing';
import { MessageToast } from './message-toast';
import { MessageService } from 'primeng/api';

describe('MessageToast', () => {
  let service: MessageToast;
  let messageServiceSpy: any;

  beforeEach(() => {
    messageServiceSpy = {
      add: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        MessageToast,
        { provide: MessageService, useValue: messageServiceSpy }
      ]
    });

    service = TestBed.inject(MessageToast);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add success toast', () => {
    service.toastSuccess('Success Title', 'Success detail');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'success',
      summary: 'Success Title',
      detail: 'Success detail',
      life: 4000
    });
  });

  it('should add error toast', () => {
    service.toastError('Error Title', 'Error detail');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Error Title',
      detail: 'Error detail',
      life: 5000
    });
  });

  it('should add warn toast', () => {
    service.toastWarn('Warn Title', 'Warn detail');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'warn',
      summary: 'Warn Title',
      detail: 'Warn detail',
      life: 4500
    });
  });

  it('should add info toast', () => {
    service.toastInfo('Info Title', 'Info detail');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'info',
      summary: 'Info Title',
      detail: 'Info detail',
      life: 4000
    });
  });

  it('should handle standard Error object in toastApiError', () => {
    const error = new Error('Network timeout');
    service.toastApiError(error, 'Custom summary');
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'Custom summary',
      detail: 'Network timeout',
      life: 5000
    });
  });

  it('should handle api error response object in toastApiError', () => {
    const error = {
      error: {
        message: 'Invalid credentials'
      }
    };
    service.toastApiError(error);
    expect(messageServiceSpy.add).toHaveBeenCalledWith({
      severity: 'error',
      summary: 'No se pudo completar la operación',
      detail: 'Invalid credentials',
      life: 5000
    });
  });
});
