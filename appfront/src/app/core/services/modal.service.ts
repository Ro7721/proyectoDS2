import { Injectable, Type } from '@angular/core';
import { Subject } from 'rxjs';

export interface ModalData {
  component: Type<any>;
  data?: any;
  header?: string;
  width?: string;
}
@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalSubject = new Subject<ModalData | null>();
  modal$ = this.modalSubject.asObservable();

  open<T>(component: Type<T>, data?: any, header = '', width = '900px') {
    this.modalSubject.next({ component, data, header, width });
  }

  close() {
    this.modalSubject.next(null);
  }
}
