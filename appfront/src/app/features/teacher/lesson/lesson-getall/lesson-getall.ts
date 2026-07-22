import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged, firstValueFrom } from 'rxjs';
import { Api } from '../../../../api/api';
import { findByTeacher, getLessonsByTeacher, delete$ } from '../../../../api/functions';
import { AuthService } from '../../../../core/auth/auth.service';
import { MessageToast } from '../../../../message/message-toast';
import { CourseResponse, FileResponse, LessonResponse } from '../../../../models/course.model';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { PaginatorModule } from 'primeng/paginator';
import { SelectModule } from 'primeng/select';
import { SkeletonModule } from 'primeng/skeleton';
import { SplitButtonModule } from 'primeng/splitbutton';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { ToastModule } from "primeng/toast";

interface LessonRow extends LessonResponse {
  courseId: string;
  courseTitle: string;
  createdAt?: string;
  files: FileResponse[];
}

interface FileRow extends FileResponse {
  index: number;
}

@Component({
  selector: 'app-lesson-getall',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ToolbarModule,
    ButtonModule,
    InputTextModule,
    SelectModule,
    TagModule,
    CardModule,
    ConfirmDialogModule,
    DialogModule,
    SkeletonModule,
    SplitButtonModule,
    PaginatorModule,
    TooltipModule,
    ToastModule
  ],
  providers: [ConfirmationService],
  templateUrl: './lesson-getall.html',
  styleUrl: './lesson-getall.css',
})
export class LessonGetall implements OnInit {
  private api = inject(Api);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private confirmationService = inject(ConfirmationService);
  private messageToast = inject(MessageToast);

  teacherId = this.authService.user?.idUser || '';
  loading = true;
  loadingCourses = true;
  courses: CourseResponse[] = [];
  lessons: LessonRow[] = [];
  filteredLessons: LessonRow[] = [];
  pagedLessons: LessonRow[] = [];
  selectedLesson: LessonRow | null = null;
  selectedFiles: FileRow[] = [];
  filesDialogVisible = false;
  totalLessons = 0;
  first = 0;
  rows = 6;
  activeVideoLessonId: string | null = null;

  readonly lessonTypeOptions = [
    { label: 'Todos los tipos', value: null },
    { label: 'Video', value: 'VIDEO' },
    { label: 'PDF', value: 'PDF' },
    { label: 'Quiz', value: 'QUIZ' },
  ];

  readonly orderOptions = [
    { label: 'Más recientes', value: 'recent' },
    { label: 'Más antiguas', value: 'oldest' },
    { label: 'Título A-Z', value: 'title-asc' },
    { label: 'Título Z-A', value: 'title-desc' },
    { label: 'Orden ascendente', value: 'order-asc' },
    { label: 'Orden descendente', value: 'order-desc' },
  ];

  readonly filtersForm = this.fb.group({
    search: [''],
    courseId: [''],
    type: [''],
    sortBy: ['recent'],
  });

  constructor() {
    this.filtersForm.valueChanges.pipe(debounceTime(150), distinctUntilChanged()).subscribe(() => {
      this.applyFilters();
    });
  }

  ngOnInit(): void {
    if (!this.teacherId) {
      this.loading = false;
      return;
    }
    void this.loadDashboardData();
  }

  private async loadDashboardData(): Promise<void> {
    this.loading = true;
    this.loadingCourses = true;

    try {
      const coursesResponse = await this.api.invoke<any, any>(findByTeacher, {
        teacherId: this.teacherId,
      });
      this.courses = coursesResponse?.data ?? [];

      this.lessons = await this.loadLessonsFromTeacher();
      this.applyFilters();
    } catch (error) {
      console.error('Error al cargar mis lecciones:', error);
      this.messageToast.toastError('Error', 'No se pudieron cargar tus lecciones.');
      this.lessons = [];
      this.filteredLessons = [];
      this.pagedLessons = [];
    } finally {
      this.loading = false;
      this.loadingCourses = false;
      this.cdr.detectChanges();
    }
  }

  private async loadLessonsFromTeacher(): Promise<LessonRow[]> {
    const response = await this.api.invoke<any, any>(getLessonsByTeacher, {
      teacherId: this.teacherId,
    });
    return this.normalizeLessons(response);
  }

  private normalizeLessons(payload: any): LessonRow[] {
    const rawItems =
      Array.isArray(payload?.data) ? payload.data :
        Array.isArray(payload) ? payload :
          Array.isArray(payload?.lessons) ? payload.lessons :
            [];

    return rawItems.map((item: any) => {
      const courseId = String(item.courseId ?? item.idCourse ?? '');
      const course = this.courses.find((entry) => entry.idCourse === courseId);
      return {
        ...item,
        courseId,
        courseTitle: course?.title ?? item.courseTitle ?? 'Sin curso',
        files: Array.isArray(item.files) ? item.files : [],
        contentUrl: item.contentUrl ?? '',
      } as LessonRow;
    });
  }

  applyFilters(): void {
    const search = (this.filtersForm.value.search ?? '').toLowerCase().trim();
    const courseId = this.filtersForm.value.courseId ?? '';
    const type = this.filtersForm.value.type ?? '';
    const sortBy = this.filtersForm.value.sortBy ?? 'recent';

    let items = [...this.lessons];

    if (search) {
      items = items.filter((lesson) =>
        [lesson.title, lesson.description, lesson.courseTitle]
          .filter(Boolean)
          .some((field) => field.toLowerCase().includes(search)),
      );
    }

    if (courseId) {
      items = items.filter((lesson) => lesson.courseId === courseId);
    }

    if (type) {
      items = items.filter((lesson) => lesson.type?.toUpperCase() === type);
    }

    items.sort((a, b) => this.compareLessons(a, b, sortBy));

    this.filteredLessons = items;
    this.totalLessons = this.lessons.length;

    this.first = 0;
    this.updatePagedLessons();
  }

  onPageChange(event: any): void {
    this.activeVideoLessonId = null;
    this.first = event.first ?? 0;
    this.rows = event.rows ?? this.rows;
    this.updatePagedLessons();
  }

  private updatePagedLessons(): void {
    this.pagedLessons = this.filteredLessons.slice(this.first, this.first + this.rows);
    this.cdr.detectChanges();
  }

  private compareLessons(a: LessonRow, b: LessonRow, sortBy: string): number {
    const aOrder = a.lessonOrder ?? 0;
    const bOrder = b.lessonOrder ?? 0;
    const aCreated = new Date(a.createdAt ?? 0).getTime();
    const bCreated = new Date(b.createdAt ?? 0).getTime();

    switch (sortBy) {
      case 'oldest':
        return aCreated - bCreated;
      case 'title-asc':
        return a.title.localeCompare(b.title);
      case 'title-desc':
        return b.title.localeCompare(a.title);
      case 'order-asc':
        return aOrder - bOrder;
      case 'order-desc':
        return bOrder - aOrder;
      case 'recent':
      default:
        return bCreated - aCreated;
    }
  }

  openFilesDialog(lesson: LessonRow): void {
    this.selectedLesson = lesson;
    this.selectedFiles = (lesson.files ?? []).map((file, index) => ({ ...file, index: index + 1 }));
    this.filesDialogVisible = true;
  }

  closeFilesDialog(): void {
    this.filesDialogVisible = false;
    this.selectedLesson = null;
    this.selectedFiles = [];
  }

  viewLesson(lesson: LessonRow): void {
    this.messageToast.toastInfo('Ver lección', `Preparando vista para "${lesson.title}".`);
  }

  editLesson(lesson: LessonRow): void {
    this.messageToast.toastInfo('Editar lección', `Abre el formulario de edición para "${lesson.title}".`);
  }

  confirmDelete(lesson: LessonRow): void {
    this.confirmationService.confirm({
      header: 'Eliminar lección',
      message: `¿Deseas eliminar "${lesson.title}"? Esta acción no se puede deshacer.`,
      icon: 'pi pi-exclamation-triangle',
      acceptLabel: 'Eliminar',
      rejectLabel: 'Cancelar',
      acceptButtonStyleClass: 'bg-rose-600 text-white border-none rounded-lg p-button-sm px-3 py-1.5',
      rejectButtonStyleClass: 'bg-slate-100 text-slate-600 border-none rounded-lg p-button-sm px-3 py-1.5',
      accept: () => { void this.deleteLesson(lesson); },
    });
  }

  private async deleteLesson(lesson: LessonRow): Promise<void> {
    try {
      const responseData = await this.api.invoke<any, any>(delete$, {
        idLesson: lesson.idLesson,
      });
      if (responseData && responseData.response && responseData.response.type === "success") {
        this.lessons = this.lessons.filter((item) => item.idLesson !== lesson.idLesson);
        this.applyFilters();
        this.messageToast.toastSuccess('Lección eliminada', `"${lesson.title}" fue eliminada correctamente.`);
      } else {
        this.messageToast.toastError('Error', responseData?.response?.message ?? 'No se pudo eliminar la lección.');
      }
    } catch (error) {
      console.error('Error al eliminar lección:', error);
      this.messageToast.toastError('Error', 'No se pudo eliminar la lección.');
    }
  }

  createLesson(): void {
    this.messageToast.toastInfo('Nueva lección', 'Abriendo formulario de creación.');
  }

  refresh(): void {
    void this.loadDashboardData();
  }

  playVideo(lessonId: string): void {
    this.activeVideoLessonId = lessonId;
    this.cdr.detectChanges();
  }

  getLessonIcon(type: string): string {
    const map: Record<string, string> = {
      VIDEO: 'pi pi-play-circle',
      PDF: 'pi pi-file-pdf',
      QUIZ: 'pi pi-question-circle',
    };
    return map[type?.toUpperCase()] ?? 'pi pi-book';
  }

  getThumbnailClass(type: string): string {
    const map: Record<string, string> = {
      VIDEO: 'from-video-gradient',
      PDF: 'from-pdf-gradient',
      QUIZ: 'from-quiz-gradient',
    };
    return map[type?.toUpperCase()] ?? 'from-pdf-gradient';
  }
  // Al final de tu clase LessonGetall
  trackById(index: number, lesson: LessonRow): string {
    return lesson.idLesson || index.toString();
  }

  // Opcional: también para archivos
  trackByFileId(index: number, file: FileRow): string {
    return file.idFile || index.toString();
  }
}
