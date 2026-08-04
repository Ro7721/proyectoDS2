import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';

import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { InputNumberModule } from 'primeng/inputnumber';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { ToggleButtonModule } from 'primeng/togglebutton';
import { FileUploadModule } from 'primeng/fileupload';
import { VideoPreviewComponent } from '../shared/video-preview/video-preview';
import { MessageToast } from '../../../../message/message-toast';

export interface LessonFormPayload {
  title: string;
  description: string;
  type: string;
  contenUrl?: string;
  isFree: string;
  mainVideoFile?: Blob;
  adjunctFiles?: Blob[];
}

function noNumbers(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = (control.value ?? '').trim();
    return value.length > 0 && /^\d+$/.test(value) ? { noNumbers: true } : null;
  };
}

function noWhitespaceOnly(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const value: string = control.value ?? '';
    if (value.length > 0 && value.trim().length === 0) {
      return { whitespaceOnly: true };
    }
    return null;
  };
}

@Component({
  selector: 'app-lesson-insert',
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
    DialogModule,
    ToggleButtonModule,
    VideoPreviewComponent,
    FileUploadModule
  ],
  templateUrl: './lesson-insert.html',
  styleUrl: './lesson-insert.css',
})


export class LessonInsert implements OnInit, OnChanges {
  @Input() lesson: LessonFormPayload | null = null;
  @Input() showDialog: boolean = false;
  @Input() isEditing: boolean = false;

  @Output() showDialogChange = new EventEmitter<boolean>();
  @Output() lessonSave = new EventEmitter<LessonFormPayload>();

  frmInserLesson: FormGroup;
  mainVideoFile: File[] = [];
  adjunctFiles: File[] = [];

  lessonTypeOptions = [
    { label: 'Video', value: 'VIDEO' },
    { label: 'Documento', value: 'PDF' }
  ];

  constructor(private readonly fb: FormBuilder, private readonly toastMessage: MessageToast) {
    this.frmInserLesson = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100), noNumbers(), noWhitespaceOnly()]],
      type: ['VIDEO', Validators.required],
      uploadVideo: [false],
      contenUrl: ['', [Validators.maxLength(255)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500), noNumbers(), noWhitespaceOnly()]],
      isFree: [false]
    });
  }

  get f() { return this.frmInserLesson.controls; }

  get selectedType(): string {
    return this.frmInserLesson.get('type')?.value;
  }

  videoRequiredError = false;

  isFieldInvalid(field: string): boolean {
    const ctrl = this.frmInserLesson.get(field);
    return !!(ctrl && ctrl.invalid && ctrl.touched);
  }

  ngOnInit(): void {
    this.updateFormWithLesson();
    this.listenToTypeChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    const dialogJustOpened =
      changes['showDialog'] &&
      changes['showDialog'].currentValue === true &&
      changes['showDialog'].previousValue === false;

    const lessonChanged = changes['lesson'] && this.frmInserLesson;

    if (dialogJustOpened || lessonChanged) {
      this.updateFormWithLesson();
    }
  }

  private listenToTypeChanges(): void {
    this.frmInserLesson.get('type')?.valueChanges.subscribe((type) => {
      if (type !== 'VIDEO') {
        this.mainVideoFile = [];
        this.videoRequiredError = false;
      }
    });
  }

  private updateFormWithLesson(): void {
    if (this.lesson) {
      const existingVideoFile = this.lesson.mainVideoFile ? [this.lesson.mainVideoFile as File] : [];
      this.frmInserLesson.patchValue({
        title: this.lesson.title,
        type: this.lesson.type,
        uploadVideo: existingVideoFile.length > 0,
        contenUrl: this.lesson.contenUrl,
        description: this.lesson.description,
        isFree: this.coerceBoolean(this.lesson.isFree)
      });
      this.mainVideoFile = existingVideoFile;
      this.adjunctFiles = this.lesson.adjunctFiles ? [...this.lesson.adjunctFiles as File[]] : [];
    } else {
      this.frmInserLesson.reset({
        type: 'VIDEO',
        uploadVideo: false,
        isFree: false
      });
      this.mainVideoFile = [];
      this.adjunctFiles = [];
    }
  }

  private coerceBoolean(value: unknown): boolean {
    return value === true || value === 'true';
  }

  onVideoSelect(event: { files?: File[] }): void {
    if (event.files && event.files.length > 0) {
      const file = event.files[0];
      if (!file.type.startsWith('video/')) {
        this.toastMessage.toastWarn('Archivo no válido', 'Selecciona un archivo de video.');
        return;
      }
      this.mainVideoFile = [file];
      this.videoRequiredError = false;
    }
  }

  onAdjunctFilesSelect(event: { files?: File[] }): void {
    this.adjunctFiles = event.files ? Array.from(event.files) : [];
  }

  clearVideo(): void {
    this.mainVideoFile = [];
  }

  clearAdjunctFiles(): void {
    this.adjunctFiles = [];
  }

  closeDialog(): void {
    this.showDialogChange.emit(false);
  }

  saveLesson(): void {
    let hasError = false;

    if (this.frmInserLesson.value.type === 'VIDEO' && this.mainVideoFile.length === 0) {
      this.videoRequiredError = true;
      hasError = true;
    }

    if (this.frmInserLesson.invalid) {
      this.frmInserLesson.markAllAsTouched();
      hasError = true;
    }

    if (hasError) return;

    const formValue = this.frmInserLesson.value;
    const lessonData: LessonFormPayload = {
      title: formValue.title,
      type: formValue.type,
      contenUrl: formValue.contenUrl?.trim() || '',
      description: formValue.description || '',
      isFree: formValue.isFree ? 'true' : 'false',
      mainVideoFile: formValue.type === 'VIDEO' ? this.mainVideoFile[0] : undefined,
      adjunctFiles: this.adjunctFiles.length > 0 ? (this.adjunctFiles as Blob[]) : undefined
    };

    this.lessonSave.emit(lessonData);
    this.frmInserLesson.reset({ type: 'VIDEO', uploadVideo: false, isFree: false });
    this.mainVideoFile = [];
    this.adjunctFiles = [];
    this.closeDialog();
  }
}
