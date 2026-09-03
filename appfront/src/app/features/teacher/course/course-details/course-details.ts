import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  OnInit,
} from '@angular/core';
import { Api } from '../../../../api/api';
import { GetById1$Params, getById1, create, Create$Params, deleteCourse } from '../../../../api/functions';
import { LessonInsert, LessonFormPayload } from '../lesson-insert/lesson-insert';
import { CourseEdit } from '../course-edit/course-edit';
import { CourseResponse } from '../../../../models/course.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MessageToast } from '../../../../message/message-toast';

@Component({
  selector: 'app-course-details',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TagModule,
    SkeletonModule,
    ChipModule,
    DividerModule,
    AccordionModule,
    LessonInsert,
    CourseEdit
  ],
  templateUrl: './course-details.html',
  styleUrl: './course-details.css',
})
export class CourseDetails implements OnInit {
  courseId: string | null = null;

  selectedCourse: CourseResponse | null = null;
  loading = false;
  showLessonDialog = false;
  isOpeningLesson = false;

  showEditCourseDialog = false;

  constructor(
    private readonly confirmation: ConfirmationService,
    private readonly toastMessage: MessageToast,
    private readonly api: Api,
    private readonly route: ActivatedRoute,
    private readonly router: Router,
    private readonly cdr: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('id');
      if (this.courseId) {
        this.loadCourseDetail(this.courseId);
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/course-getall']);
  }

  loadCourseDetail(idCourse: string): void {
    this.loading = true;
    this.selectedCourse = null;

    this.api
      .invoke<GetById1$Params, any>(getById1, { idCourse })
      .then((response) => {
        this.selectedCourse = response?.data ?? null;
        this.loading = false;
        this.cdr.detectChanges();
      })
      .catch((error) => {
        console.error('Error al cargar detalle:', error);
        this.loading = false;
        this.goBack();
        this.toastMessage.toastError('Error', 'No se pudo cargar el detalle del curso.');
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
    this.isOpeningLesson = true;
    this.showLessonDialog = true;
  }

  onLessonDialogClose(isVisible: boolean): void {
    this.showLessonDialog = isVisible;
    if (!isVisible) {
      this.isOpeningLesson = false;
    }
  }

  onSaveLesson(payload: LessonFormPayload): void {
    if (!this.courseId) return;

    this.loading = true;
    const params: Create$Params = {
      body: {
        courseId: this.courseId,
        title: payload.title,
        description: payload.description,
        type: payload.type,
        contenUrl: payload.contenUrl,
        free: payload.isFree === 'true' || payload.isFree === true as any,
        mainVideoFile: payload.mainVideoFile,
        adjunctFiles: payload.adjunctFiles,
      }
    };

    this.api
      .invoke<Create$Params, any>(create, params)
      .then(() => {
        this.toastMessage.toastSuccess('Éxito', 'Lección creada correctamente.');
        this.loadCourseDetail(this.courseId as string);
      })
      .catch((error) => {
        console.error('Error al crear lección:', error);
        this.toastMessage.toastError('Error', 'No se pudo crear la lección.');
      })
      .finally(() => {
        this.loading = false;
        this.onLessonDialogClose(false);
        this.cdr.detectChanges();
      });
  }

  confirmDeleteCourse(event: Event): void {
    this.confirmation.confirm({
      target: event.target as HTMLElement,
      message: '¿Estás seguro de que deseas eliminar este curso? Esta acción no se puede deshacer.',
      header: 'Confirmar Eliminación',
      icon: 'pi pi-trash',
      acceptLabel: 'Sí, eliminar',
      rejectLabel: 'No, cancelar',
      acceptButtonStyleClass: 'p-button-danger',
      rejectButtonStyleClass: 'p-button-secondary p-button-text',
      accept: () => {
        this.deleteCourse();
      },
      reject: () => {
        this.toastMessage.toastInfo('Cancelado', 'La eliminación del curso fue cancelada');
      }
    });
  }

  deleteCourse(): void {
    if (!this.courseId) return;
    this.api.invoke(deleteCourse, { idCourse: this.courseId }).then((response: any) => {
      const body = typeof response === 'string' ? JSON.parse(response) : response;
      const genericResponse = body?.response;
      const message = genericResponse?.listMessage?.[0] || 'Operación completada';

      if (genericResponse?.type === 'success' || genericResponse?.type === 'SUCCESS') {
        this.toastMessage.toastSuccess('Curso eliminado', message);
        this.goBack();
      } else {
        this.toastMessage.toastWarn('Atención', message);
      }
    }).catch(error => {
      let errorMessage = 'Ocurrió un error al eliminar';
      if (error?.error?.response?.listMessage?.length) {
        errorMessage = error.error.response.listMessage.join(', ');
      } else if (error?.message) {
        errorMessage = error.message;
      }
      this.toastMessage.toastError('Error', errorMessage);
    });
  }

  openEditCourse(): void {
    this.showEditCourseDialog = true;
  }
}
