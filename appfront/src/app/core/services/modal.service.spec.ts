import { TestBed } from '@angular/core/testing';
import { ModalService } from './modal.service';
import { Component } from '@angular/core';
import { firstValueFrom } from 'rxjs';

@Component({ template: '' })
class DummyComponent {}

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should emit modal data when open is called', async () => {
    const testData = { id: 1 };
    
    const promise = firstValueFrom(service.modal$);
    service.open(DummyComponent, testData, 'Test Header', '500px');
    const data = await promise;
    
    expect(data).toBeTruthy();
    expect(data?.component).toBe(DummyComponent);
    expect(data?.data).toBe(testData);
    expect(data?.header).toBe('Test Header');
    expect(data?.width).toBe('500px');
  });

  it('should emit modal data with default values when open is called', async () => {
    const promise = firstValueFrom(service.modal$);
    service.open(DummyComponent);
    const data = await promise;
    
    expect(data?.component).toBe(DummyComponent);
    expect(data?.data).toBeUndefined();
    expect(data?.header).toBe('');
    expect(data?.width).toBe('900px');
  });

  it('should emit null when close is called', async () => {
    const promise = firstValueFrom(service.modal$);
    service.close();
    const data = await promise;
    expect(data).toBeNull();
  });

});
