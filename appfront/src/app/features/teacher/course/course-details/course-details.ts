import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
  inject,
} from '@angular/core';
import { Api } from '../../../../api/api';
import { ApidetailsCourse$Params, apidetailsCourse, apicreateLesson, ApicreateLesson$Params } from '../../../../api/functions';
import { LessonInsert, LessonFormPayload } from '../lesson-insert/lesson-insert';
import { CourseResponse } from '../../../../models/course.model';
import { MessageService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';

@Component({
  selector: 'app-course-details',
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    ChipModule,
    DividerModule,
    AccordionModule,
    LessonInsert
  ],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails implements OnChanges {
  @Input() visible = false;
  @Input() courseId: string | null = null;
  @Output() visibleChange = new EventEmitter<boolean>();

  private api = inject(Api);
  private cdr = inject(ChangeDetectorRef);
  private messageService = inject(MessageService);

  selectedCourse: CourseResponse | null = null;
  loading = false;
  showLessonDialog = false;
  isOpeningLesson = false;


  ngOnChanges(changes: SimpleChanges): void {
    const shouldLoad =
      this.visible &&
      this.courseId &&
      (changes['courseId']?.currentValue !== changes['courseId']?.previousValue ||
        changes['visible']?.currentValue === true);

    if (shouldLoad) {
      this.loadCourseDetail(this.courseId as string);
    }
  }

  close(): void {
    if (this.isOpeningLesson) return;
    this.visible = false;
    this.visibleChange.emit(false);
    this.selectedCourse = null;
  }

  private loadCourseDetail(idCourse: string): void {
    this.loading = true;
    this.selectedCourse = null;

    this.api
      .invoke<ApidetailsCourse$Params, any>(apidetailsCourse, { idCourse })
      .then((response) => {
        this.selectedCourse = response?.data ?? null;
        this.loading = false;
        this.cdr.detectChanges();
      })
      .catch((error) => {
        console.error('Error al cargar detalle:', error);
        this.loading = false;
        this.close();
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo cargar el detalle del curso.',
        });
        this.cdr.detectChanges();
      });
  }

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

  formatPrice(price: number): string {
    if (!price) return 'Gratis';
    return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(price);
  }

  get totalFreeLessons(): number {
    return this.selectedCourse?.lessons?.filter((lesson) => lesson.isFree).length ?? 0;
  }

  get totalDuration(): number {
    return (
      this.selectedCourse?.lessons?.reduce(
        (acc, lesson) => acc + (lesson.durationMinutes ?? 0),
        0,
      ) ?? 0
    );
  }

  openNewLessonDialog(): void {
    // Indicamos que estamos abriendo la lección para evitar que `close()` limpie el estado
    this.isOpeningLesson = true;
    
    // Cerramos el modal de detalles (esto disparará onHide que llama a close())
    this.visible = false;
    
    // Esperamos a que termine la animación de PrimeNG antes de abrir el otro modal
    setTimeout(() => {
      if (!this.courseId) return;
      this.showLessonDialog = true;
    }, 300);
  }

  onLessonDialogClose(isVisible: boolean): void {
    this.showLessonDialog = isVisible;
    if (!isVisible) {
      // Cuando se cierra el modal de lección, indicamos que ya no estamos en transición
      this.isOpeningLesson = false;
      // Reabrimos el modal de detalles
      setTimeout(() => {
        this.visible = true;
      }, 300);
    }
  }

  onSaveLesson(payload: LessonFormPayload): void {
    if (!this.courseId) return;

    this.loading = true;
    const params: ApicreateLesson$Params = {
      body: {
        courseId: this.courseId,
        title: payload.title,
        description: payload.description,
        type: payload.type,
        contenUrl: payload.contenUrl,
        isFree: payload.isFree,
        mainVideoFile: payload.mainVideoFile,
        adjunctFiles: payload.adjunctFiles,
      }
    };

    this.api
      .invoke<ApicreateLesson$Params, any>(apicreateLesson, params)
      .then(() => {
        this.messageService.add({
          severity: 'success',
          summary: 'Éxito',
          detail: 'Lección creada correctamente.',
        });
        this.loadCourseDetail(this.courseId as string); // Actualiza la lista
      })
      .catch((error) => {
        console.error('Error al crear lección:', error);
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo crear la lección.',
        });
      })
      .finally(() => {
        this.loading = false;
        // Al setear showLessonDialog = false, el HTML llamará a onLessonDialogClose
        // que se encargará de reabrir el course-details.
        this.onLessonDialogClose(false);
        this.cdr.detectChanges();
      });
  }
}
