import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ChangeDetectorRef, Component, PLATFORM_ID, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { Api } from '../../api/api';
import { PublicCourseCard$Params, publicCourseCard } from '../../api/functions';
import { CourseCardResponse } from '../../models/course.model';
import { CourseCard } from '../../features/coursecard/course-card/course-card';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-home',
  imports: [CommonModule, RouterLink, MatIconModule, CourseCard],
  templateUrl: './home.html',
  styleUrl: './home.css',
})
export class Home implements OnInit {
  private api = inject(Api);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);
  private platformId = inject(PLATFORM_ID);

  isMenuOpen = false;
  publicCourses: CourseCardResponse[] = [];
  loadingCourses = true;
  coursesLoadError = false;

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      this.loadingCourses = false;
      return;
    }

    this.loadPublicCourses();
  }

  toggleMenu() {
    this.isMenuOpen = !this.isMenuOpen;
  }

  private loadPublicCourses(): void {
    this.loadingCourses = true;
    this.coursesLoadError = false;

    this.api.invoke<PublicCourseCard$Params, any>(publicCourseCard)
      .then((response) => {
        this.publicCourses = response?.data ?? [];
        this.loadingCourses = false;
        this.cdr.detectChanges();
      })
      .catch((error) => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Error al cargar cursos publicos',
        });
        this.publicCourses = [];
        this.loadingCourses = false;
        this.coursesLoadError = true;
        this.cdr.detectChanges();
      });
  }
}
