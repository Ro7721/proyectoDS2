import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from "primeng/button";
import { CourseResponse } from '../../../models/course.model';
import { Api } from '../../../api/api';
import { getAllCourses } from '../../../api/functions';
import { MessageToast } from '../../../message/message-toast';
@Component({
  selector: 'app-course-modal',
  imports: [CommonModule, ButtonModule],
  templateUrl: './course-modal.html',
  styleUrl: './course-modal.css',
})
export class CourseModal {

  @Input() course: CourseResponse | null = null;

  isVisible = false;
  @Input() set visible(val: boolean) {
    this.isVisible = val;
  }
  get visible(): boolean {
    return this.isVisible;
  }

  @Output() close = new EventEmitter<void>();
  @Output() buy = new EventEmitter<any>();

  selectedCourseId: string | null = null;

  constructor(private api: Api, private toast: MessageToast) { }
  showModal(course: CourseResponse) {
    this.course = course;
    this.isVisible = true;
    this.loadCourseDetails();
  }
  hideModal() {
    this.isVisible = false;
    this.close.emit();
  }
  closeOutside(event: any) {
    if (event.target.classList.contains('fixed')) {
      this.hideModal();
    }
  }

  loadCourseDetails() {
    this.api.invoke(getAllCourses).then((response: any) => {
      const apiResponseData = typeof response == 'string' ? JSON.parse(response) : response;

      if (Array.isArray(apiResponseData) && apiResponseData.length > 0) {
        const courseList = apiResponseData;

        if (this.selectedCourseId) {
          const course = courseList.find((c: CourseResponse) => c.idCourse === this.selectedCourseId);
          if (course) {
            this.course = course;
          }
        }
      }
    })
  }

  buyCourse(event: Event) {
    event.stopPropagation();
    this.buy.emit(this.course);
    this.toast.toastSuccess('Compra realizada', 'El curso se ha añadido a tu carrito');
    this.hideModal();
  }

  applyDiscount(price: number) {
    return price - (price * 0.05);
  }
}
