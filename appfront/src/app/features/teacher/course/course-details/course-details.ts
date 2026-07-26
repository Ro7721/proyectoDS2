import { CommonModule } from '@angular/common';
import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { Api } from '../../../../api/api';
import { GetById1$Params, getById1, create, Create$Params } from '../../../../api/functions';
import { LessonInsert, LessonFormPayload } from '../lesson-insert/lesson-insert';
import { CourseResponse } from '../../../../models/course.model';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmationService, MessageService } from 'primeng/api';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { ChipModule } from 'primeng/chip';
import { DialogModule } from 'primeng/dialog';
import { DividerModule } from 'primeng/divider';
import { SkeletonModule } from 'primeng/skeleton';
import { TagModule } from 'primeng/tag';
import { MessageToast } from '../../../../message/message-toast';
import { deleteCourse, updateCourse, UpdateCourse$Params } from '../../../../api/functions';
import { getAll1 } from '../../../../api/functions';
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
    LessonInsert,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    InputNumberModule
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
  courseForm: FormGroup;
  listCategories: any[] = [];
  levelOptions = [
    { label: 'Principiante', value: 'BASIC' },
    { label: 'Intermedio', value: 'INTERMEDIATE' },
    { label: 'Avanzado', value: 'ADVANCED' },
  ];
  coverImageFile: Blob | null = null;
  coverImagePreview: string | null = null;
  savingCourse = false;

  constructor(
    private confirmation: ConfirmationService,
    private toastMessage: MessageToast,
    private fb: FormBuilder,
    private api: Api,
    private route: ActivatedRoute,
    private router: Router,
    private cdr: ChangeDetectorRef,
    private messageService: MessageService,
  ) {
    this.courseForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      idCategory: [null, Validators.required],
      level: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      status: ['DRAFT', Validators.required]
    });
  }


  ngOnInit(): void {
    this.loadCategories();
    this.route.paramMap.subscribe(params => {
      this.courseId = params.get('id');
      if (this.courseId) {
        this.loadCourseDetail(this.courseId);
      }
    });
  }

  private loadCategories(): void {
    this.api.invoke(getAll1).then((response: any) => {
      const data = typeof response === 'string' ? JSON.parse(response) : response;
      this.listCategories = data;
    });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/course-getall']);
  }

  private loadCourseDetail(idCourse: string): void {
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

    this.isOpeningLesson = true;

    // Abrimos el modal de lecciones
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
    if (!this.selectedCourse) return;

    // Find category ID based on category name
    const cat = this.listCategories.find(c => c.name === this.selectedCourse?.categoryName);

    this.courseForm.patchValue({
      title: this.selectedCourse.title,
      description: this.selectedCourse.description,
      idCategory: cat ? cat.idCategory : null,
      level: this.selectedCourse.level,
      price: this.selectedCourse.price,
      status: this.selectedCourse.status
    });
    this.coverImagePreview = this.selectedCourse.coverImage;
    this.coverImageFile = null;
    this.showEditCourseDialog = true;
  }

  onCoverInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      const file = input.files[0];
      if (file.size > 5 * 1024 * 1024) {
        this.toastMessage.toastWarn('Imagen muy grande', 'El archivo no debe superar los 5 MB');
        return;
      }
      this.coverImageFile = file;
      const reader = new FileReader();
      reader.onload = (e) => {
        this.coverImagePreview = e.target?.result as string;
      };
      reader.readAsDataURL(file);
    }
  }

  saveEditedCourse(): void {
    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      this.toastMessage.toastWarn('Campos incompletos', 'Completa los campos obligatorios');
      return;
    }

    if (!this.courseId) return;

    this.savingCourse = true;
    const formValue = this.courseForm.value;

    const params: UpdateCourse$Params = {
      idCourse: this.courseId,
      body: {
        title: formValue.title,
        description: formValue.description,
        idCategory: formValue.idCategory,
        level: formValue.level,
        price: formValue.price,
        status: formValue.status,
        coverImage: this.coverImageFile || undefined
      } as any
    };

    this.api.invoke(updateCourse, params).then((response: any) => {
      const body = typeof response === 'string' ? JSON.parse(response) : response;
      if (body?.response?.type === 'success' || body?.response?.type === 'SUCCESS') {
        this.toastMessage.toastSuccess('Éxito', 'Curso actualizado correctamente');
        this.showEditCourseDialog = false;
        this.loadCourseDetail(this.courseId!);
      } else {
        this.toastMessage.toastWarn('Atención', body?.response?.listMessage?.[0] || 'No se pudo actualizar');
      }
    }).catch(e => {
      this.toastMessage.toastError('Error', 'No se pudo actualizar el curso');
    }).finally(() => {
      this.savingCourse = false;
      this.cdr.detectChanges();
    });
  }
}
