import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';

import { Api } from '../../../../api/api';
import { updateCourse, UpdateCourse$Params, getAll1 } from '../../../../api/functions';
import { CourseResponse } from '../../../../models/course.model';
import { MessageToast } from '../../../../message/message-toast';
import { AuthService } from '../../../../core/auth/auth.service';

@Component({
  selector: 'app-course-edit',
  standalone: true,
  imports: [
    CommonModule,
    DialogModule,
    ButtonModule,
    ReactiveFormsModule,
    InputTextModule,
    TextareaModule,
    SelectModule,
    InputNumberModule,
  ],
  templateUrl: './course-edit.html',
  styleUrl: './course-edit.css',
})
export class CourseEdit implements OnInit, OnChanges {
  @Input() showDialog = false;
  @Input() courseId: string | null = null;
  @Input() course: CourseResponse | null = null;

  @Output() showDialogChange = new EventEmitter<boolean>();
  @Output() saveSuccess = new EventEmitter<void>();

  courseForm: FormGroup;
  savingCourse = false;
  coverImageFile: Blob | null = null;
  coverPreview: string | null = null;
  listCategories: any[] = [];

  levelOptions = [
    { label: 'Principiante', value: 'BASIC' },
    { label: 'Intermedio', value: 'INTERMEDIATE' },
    { label: 'Avanzado', value: 'ADVANCED' },
  ];

  constructor(
    private readonly fb: FormBuilder,
    private readonly api: Api,
    private readonly toastMessage: MessageToast,
    private readonly authService: AuthService,
    private readonly cdr: ChangeDetectorRef
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
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['showDialog']?.currentValue === true) {
      this.initForm();
    }
  }

  private loadCategories(): void {
    this.api.invoke(getAll1).then((response: any) => {
      const data = typeof response === 'string' ? JSON.parse(response) : response;
      this.listCategories = data?.data || data;
    });
  }

  private initForm(): void {
    if (!this.course) return;

    const cat = this.listCategories.find(c => c.name === this.course?.categoryName);

    let mappedLevel: string = this.course.level;
    if (['Básico', 'BÁSICO', 'BASICO', 'Principiante', ' Principiante'].includes(mappedLevel)) mappedLevel = 'BASIC';
    else if (['Intermedio', 'INTERMEDIO'].includes(mappedLevel)) mappedLevel = 'INTERMEDIATE';
    else if (['Avanzado', 'AVANZADO'].includes(mappedLevel)) mappedLevel = 'ADVANCED';

    let mappedStatus: string = this.course.status;
    if (['Borrador', 'BORRADOR'].includes(mappedStatus)) mappedStatus = 'DRAFT';
    else if (['Publicado', 'PUBLICADO'].includes(mappedStatus)) mappedStatus = 'PUBLISHED';

    this.courseForm.patchValue({
      title: this.course.title,
      description: this.course.description,
      idCategory: cat ? cat.idCategory : null,
      level: mappedLevel,
      price: this.course.price,
      status: mappedStatus
    });
    this.coverPreview = this.course.coverImage || null;
    this.coverImageFile = null;
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
        this.coverPreview = e.target?.result as string;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  saveUpdateCourse(): void {
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
        idTeacher: this.authService.user?.idUser || undefined,
        coverImage: this.coverImageFile || undefined
      } as any
    };

    this.api.invoke(updateCourse, params).then((response: any) => {
      const body = typeof response === 'string' ? JSON.parse(response) : response;
      if (body?.response?.type === 'success' || body?.response?.type === 'SUCCESS') {
        this.toastMessage.toastSuccess('Éxito', 'Curso actualizado correctamente');
        this.showDialogChange.emit(false);
        this.saveSuccess.emit();
      } else {
        this.toastMessage.toastWarn('Atención', body?.response?.listMessage?.[0] || 'No se pudo actualizar');
      }
    }).catch(e => {
      console.error(e);
      this.toastMessage.toastError('Error', 'No se pudo actualizar el curso');
    }).finally(() => {
      this.savingCourse = false;
      this.cdr.detectChanges();
    });
  }

  closeDialog(): void {
    this.showDialogChange.emit(false);
  }
}
