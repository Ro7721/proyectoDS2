import { Component, inject, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG imports
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { TagModule } from 'primeng/tag';
import { ToastModule } from 'primeng/toast';
import { ProgressSpinnerModule } from 'primeng/progressspinner';
import { MessageService } from 'primeng/api';
import { AuthService } from '../../../../core/auth/auth.service';
import { Api } from '../../../../api/api';
import {
  apicreateCourse,
  apigetallCategory,
  apicreateLesson,
} from '../../../../api/functions';
import { LessonInsert, LessonFormPayload } from '../lesson-insert/lesson-insert';
import { MessageToast } from '../../../../message/message-toast';
// ─── Interfaces ────────────────────────────────────────────────────────────────

interface Category {
  idCategory: string;
  name: string;
  description?: string;
}

interface LessonDisplay extends LessonFormPayload {
  id?: string;
  saved: boolean;
}

// ─── Component ─────────────────────────────────────────────────────────────────

@Component({
  selector: 'app-course-insert',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    InputNumberModule,
    ButtonModule,
    TagModule,
    ToastModule,
    ProgressSpinnerModule,
    LessonInsert,
  ],
  providers: [MessageService],
  templateUrl: './course-insert.html',
  styleUrl: './course-insert.css',
})
export class CourseInsert implements OnInit {

  private cdr = inject(ChangeDetectorRef);
  private authService = inject(AuthService);

  // ── Curso ──────────────────────────────────────────────────────────────────
  courseForm: FormGroup;
  courseStatus = 'DRAFT';
  coverImageFile: Blob | null = null;
  coverImagePreview: string | null = null;
  // obtener el id del teacher logeado
  idTeacher = this.authService.user?.idUser || '';

  listCategories: Category[] = [];

  levelOptions = [
    { label: 'Principiante', value: 'BASIC' },
    { label: 'Intermedio', value: 'INTERMEDIATE' },
    { label: 'Avanzado', value: 'ADVANCED' },
  ];

  // ── Lecciones ─────────────────────────────────────────────────────────────
  listLessons: LessonDisplay[] = [];
  showLessonDialog = false;
  currentLesson: LessonFormPayload | null = null;
  editingIndex: number | null = null;

  // ── Estado UI ──────────────────────────────────────────────────────────────
  loading = false;
  courseCreated = false;
  createdCourseId: string | null = null;
  // ── Constructor ───────────────────────────────────────────────────────────
  constructor(
    private fb: FormBuilder,
    private api: Api,
    private messageToast: MessageToast
  ) {
    this.courseForm = this.fb.group({
      courseTitle: ['', Validators.required],
      courseDescription: ['', Validators.required],
      selectedCategoryId: [null, Validators.required],
      courseLevel: ['', Validators.required],
      coursePrice: [0, [Validators.required, Validators.min(0)]],
    });
  }

  ngOnInit(): void {
    this.loadCategories();
  }

  // ── Categorías ────────────────────────────────────────────────────────────

  private loadCategories(): void {
    this.api.invoke(apigetallCategory)
      .then((response: any) => {

        const responseData =
          typeof response === 'string'
            ? JSON.parse(response)
            : response;

        console.log('Categorias:', responseData);

        this.listCategories = responseData;
        this.cdr.detectChanges();
      })
      .catch(error => {
        console.error('Error al cargar categorías:', error);
        this.messageToast.toastError('Error', 'No se pudieron cargar las categorías');
        this.cdr.detectChanges();
      });
  }

  // ── Portada ───────────────────────────────────────────────────────────────

  onCoverInputChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files?.[0]) {
      this.setCoverImage(input.files[0]);
    }
  }

  onCoverDrop(event: DragEvent): void {
    event.preventDefault();
    const file = event.dataTransfer?.files?.[0];
    if (file && file.type.startsWith('image/')) {
      this.setCoverImage(file);
    } else {
      this.messageToast.toastError('Archivo no válido', 'Solo se aceptan imágenes (PNG, JPG, WEBP)');
    }
  }

  private setCoverImage(file: File): void {
    if (file.size > 5 * 1024 * 1024) {
      this.messageToast.toastWarn('Imagen muy grande', 'El archivo no debe superar los 5 MB');
      return;
    }
    this.coverImageFile = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      this.coverImagePreview = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  }

  // ── Gestión de lecciones ──────────────────────────────────────────────────

  openAddLesson(): void {
    this.editingIndex = null;
    this.currentLesson = null; // Envia null para limpiar el formulario en el hijo
    this.showLessonDialog = true;
  }

  openEditLesson(index: number): void {
    this.editingIndex = index;
    this.currentLesson = { ...this.listLessons[index] };
    this.showLessonDialog = true;
  }

  handleLessonSave(lessonData: LessonFormPayload): void {
    if (this.editingIndex !== null) {
      this.listLessons[this.editingIndex] = {
        ...lessonData,
        saved: this.listLessons[this.editingIndex].saved,
      };
      this.messageToast.toastSuccess('Lección actualizada', `"${lessonData.title}" fue editada correctamente`);
    } else {
      this.listLessons.push({ ...lessonData, saved: false });
      this.messageToast.toastSuccess('Lección agregada', `"${lessonData.title}" se agregó a la lista`);
    }
    this.showLessonDialog = false;
  }

  removeLesson(index: number): void {
    const name = this.listLessons[index].title;
    this.listLessons.splice(index, 1);
    this.messageToast.toastWarn('Lección eliminada', `"${name}" fue removida de la lista`);
  }

  // ── Guardar curso ─────────────────────────────────────────────────────────

  async saveCourse(status: 'DRAFT' | 'PUBLISHED'): Promise<void> {
    if (!this.coverImageFile) {
      this.messageToast.toastWarn('Falta la portada', 'Selecciona una imagen de portada para continuar');
      return;
    }

    if (this.courseForm.invalid) {
      this.courseForm.markAllAsTouched();
      this.messageToast.toastWarn('Campos incompletos', 'Completa todos los campos obligatorios del curso');
      return;
    }

    const formValue = this.courseForm.value;

    this.loading = true;
    this.courseStatus = status;

    try {
      const resp = await this.api.invoke$Response(apicreateCourse, {
        body: {
          title: formValue.courseTitle,
          description: formValue.courseDescription,
          idCategory: String(formValue.selectedCategoryId),
          idTeacher: this.idTeacher,
          level: formValue.courseLevel,
          price: String(formValue.coursePrice),
          status: this.courseStatus,
          coverImage: [this.coverImageFile],
        },
      });

      const body = JSON.parse(resp.body as any);
      this.createdCourseId = body?.data?.idCourse ?? null;
      this.courseCreated = true;

      if (this.listLessons.length > 0 && this.createdCourseId) {
        await this.saveAllLessons(this.createdCourseId);
      }

      const label = status === 'DRAFT' ? 'guardado como borrador' : 'publicado';
      this.messageToast.toastSuccess(
        `Curso ${label}`,
        `"${formValue.courseTitle}" fue ${label} exitosamente`,
      );

    } catch (e) {
      this.messageToast.toastError('Error al guardar', 'Ocurrió un problema al procesar el curso. Intenta de nuevo.');
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // ── Guardar lecciones ─────────────────────────────────────────────────────

  private async saveAllLessons(courseId: string): Promise<void> {
    let saved = 0;
    let failed = 0;

    for (let i = 0; i < this.listLessons.length; i++) {
      const lesson = this.listLessons[i];
      if (lesson.saved) continue;

      try {
        await this.api.invoke$Response(apicreateLesson, {
          body: {
            title: lesson.title,
            description: lesson.description,
            type: lesson.type,
            contenUrl: lesson.contenUrl,
            isFree: String(lesson.isFree),
            courseId,
            mainVideoFile: lesson.mainVideoFile,
            adjunctFiles: lesson.adjunctFiles
          },

        });
        this.listLessons[i].saved = true;
        saved++;
      } catch (e) {
        console.error(`Error al guardar lección "${lesson.title}":`, e);
        failed++;
      }
    }

    if (failed > 0) {
      this.messageToast.toastWarn(
        'Algunas lecciones fallaron',
        `${saved} guardadas correctamente, ${failed} con error`,
      );
    }
  }

  async addLessonToExistingCourse(): Promise<void> {
    if (!this.createdCourseId) return;
    this.loading = true;
    try {
      await this.saveAllLessons(this.createdCourseId);
      const pendingLeft = this.listLessons.filter(l => !l.saved).length;
      if (pendingLeft === 0) {
        this.messageToast.toastSuccess('Lecciones guardadas', 'Todas las lecciones fueron subidas correctamente');
      }
    } finally {
      this.loading = false;
      this.cdr.detectChanges();
    }
  }

  // ── Helpers de UI ─────────────────────────────────────────────────────────

  getLessonTypeLabel(type: string): string {
    switch (type) {
      case 'VIDEO': return 'Video';
      case 'PDF': return 'Documento';
      default: return 'Recurso';
    }
  }

}