import { Component, inject, OnInit } from '@angular/core';
import { Api } from '../../../../api/api';
import { CourseResponse, LessonResponse, FileResponse } from '../../../../models/course.model';
import { apicoursesbyteacher, Apicoursesbyteacher$Params, apidetailsCourse, ApidetailsCourse$Params } from '../../../../api/functions';
import { MessageService } from 'primeng/api';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { InputTextModule } from 'primeng/inputtext';
import { AccordionModule } from 'primeng/accordion';
import { HttpClient } from '@angular/common/http';
import { SkeletonModule } from 'primeng/skeleton';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { TooltipModule } from 'primeng/tooltip';
import { AvatarModule } from 'primeng/avatar';
import { ScrollPanelModule } from 'primeng/scrollpanel';
import { Toast } from "primeng/toast";
@Component({
  selector: 'app-course-getall',
  imports: [CommonModule, FormsModule, DialogModule,
    ButtonModule, TagModule, InputTextModule, AccordionModule,
    SkeletonModule, ChipModule, DividerModule, TooltipModule, AvatarModule,
    ScrollPanelModule, Toast],
  templateUrl: './course-getall.html',
  styleUrl: './course-getall.css',
})
export class CourseGetall implements OnInit {


  private messageService = inject(MessageService);

  private api = inject(Api);

  listCourses: CourseResponse[] = [];
  selectedCourse: CourseResponse | null = null;
  loading = true;
  detailLoading = false;
  showModal = false;
  notFound = false;

  // TODO: reemplazar con AuthService cuando implementes el login
  private teacherId = 'cbc516d9-3b5e-47a6-8c53-ccd271ec277e';

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.loadCourses();
  }

  // ── Carga el listado de cursos del docente ────────────────────────────
  loadCourses(): void {
    this.loading = true;
    this.notFound = false;

    this.api.invoke<Apicoursesbyteacher$Params, any>(
      apicoursesbyteacher,
      {
        teacherId: this.teacherId
      }
    )
      .then((response: any) => {
        console.log('Cursos cargados:', response);
        this.listCourses = response?.data ?? [];
        this.notFound = this.listCourses.length === 0;
        this.loading = false;
      })
      .catch((error) => {
        console.error('Error al cargar cursos:', error);
        this.loading = false;
        this.notFound = true;
      });
  }

  // ── Abre el modal con el detalle del curso seleccionado ───────────────
  openCourseDetail(course: CourseResponse): void {
    this.showModal = true;
    this.detailLoading = true;
    this.selectedCourse = null;

    this.api.invoke<ApidetailsCourse$Params, any>(
      apidetailsCourse,
      {
        idCourse: course.idCourse
      }
    )
      .then((response: any) => {
        console.log('Detalle del curso:', response);
        this.selectedCourse = response?.data ?? null;
        this.detailLoading = false;
      })
      .catch((error) => {
        console.error('Error al cargar detalle:', error);
        this.handleDetailError();
      });
  }

  // ── Lógica de error del detalle unificada (evita repetición) ─────────
  private handleDetailError(): void {
    this.detailLoading = false;
    this.showModal = false;
    this.messageService.add({
      severity: 'error',
      summary: 'Error',
      detail: 'No se pudo cargar el detalle del curso.',
    });
  }

  closeModal(): void {
    this.showModal = false;
    this.selectedCourse = null;
  }

  // ── Helpers de UI ─────────────────────────────────────────────────────

  getLevelSeverity(level: string): 'success' | 'info' | 'warn' | 'danger' | 'secondary' | 'contrast' {
    const map: Record<string, 'success' | 'info' | 'warn'> = {
      BASICO: 'success',
      INTERMEDIO: 'info',
      AVANZADO: 'warn',
    };
    return map[level?.toUpperCase()] ?? 'info';
  }

  getStatusSeverity(status: string): 'success' | 'warn' | 'secondary' {
    const map: Record<string, 'success' | 'warn' | 'secondary'> = {
      PUBLICADO: 'success',
      BORRADOR: 'secondary',
      PAUSADO: 'warn',
    };
    return map[status?.toUpperCase()] ?? 'secondary';
  }

  getLessonTypeIcon(type: string): string {
    const map: Record<string, string> = {
      VIDEO: 'pi-play-circle',
      TEXTO: 'pi-file-edit',
      QUIZ: 'pi-question-circle',
      ARCHIVO: 'pi-paperclip',
    };
    return map[type?.toUpperCase()] ?? 'pi-book';
  }

  getFileIcon(fileType: string): string {
    const map: Record<string, string> = {
      PDF: 'pi-file-pdf',
      VIDEO: 'pi-video',
      IMAGEN: 'pi-image',
      AUDIO: 'pi-volume-up',
    };
    return map[fileType?.toUpperCase()] ?? 'pi-file';
  }

  formatPrice(price: number): string {
    if (price === 0) return 'Gratis';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(price);
  }

  get totalFreeLessons(): number {
    return this.selectedCourse?.lessons?.filter((l) => l.isFree).length ?? 0;
  }

  get totalDuration(): number {
    return this.selectedCourse?.lessons
      ?.reduce((acc, l) => acc + (l.durationMinutes ?? 0), 0) ?? 0;
  }
}



