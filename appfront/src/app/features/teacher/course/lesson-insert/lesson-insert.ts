import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';

// PrimeNG imports
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
  mainVideoFile?: Blob[];
  adjunctFiles?: Blob[];
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
  @Input() lesson: any | null = null;
  @Input() showDialog: boolean = false;
  @Input() isEditing: boolean = false;

  @Output() showDialogChange = new EventEmitter<boolean>();
  @Output() onSaveLesson = new EventEmitter<LessonFormPayload>();

  frmInserLesson: FormGroup;
  mainVideoFile: File[] = [];
  adjunctFiles: File[] = [];

  lessonTypeOptions = [
    { label: 'Video', value: 'VIDEO' },
    { label: 'Documento', value: 'PDF' },
    { label: 'Texto', value: 'TEXT' }
  ];

  constructor(private fb: FormBuilder, private toastMessage: MessageToast) {
    this.frmInserLesson = this.fb.group({
      title: ['', Validators.required],
      type: ['VIDEO', Validators.required],
      contenUrl: [''],
      description: ['', Validators.required],
      isFree: [false]
    });
  }

  ngOnInit(): void {
    this.updateFormWithLesson();
    this.listenToTypeChanges();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lesson'] && this.lesson) {
      this.updateFormWithLesson();
    }
  }
  private listenToTypeChanges(): void {
    this.frmInserLesson.get('type')?.valueChanges.subscribe((type) => {
      this.mainVideoFile = [];
    });
  }

  private updateFormWithLesson(): void {
    if (this.lesson) {
      this.frmInserLesson.patchValue({
        title: this.lesson.title,
        type: this.lesson.type,
        contenUrl: this.lesson.contenUrl,
        description: this.lesson.description,
        isFree: this.lesson.isFree
      });
      this.mainVideoFile = this.lesson.mainVideoFile ? [...this.lesson.mainVideoFile] : [];
      this.adjunctFiles = this.lesson.adjunctFiles ? [...this.lesson.adjunctFiles] : [];
      this.toastMessage.toastSuccess('Leccion cargada correctamente');
    } else {
      this.frmInserLesson.reset({
        type: 'VIDEO',
        isFree: false
      });
      this.mainVideoFile = [];
      this.adjunctFiles = [];
    }
  }

  // Captura el archivo de video principal de PrimeNG
  onVideoSelect(event: any): void {
    if (event.files && event.files.length > 0) {
      this.mainVideoFile = [event.files[0]]; // Envolvemos en un arreglo para cumplir con ApicreateLesson$Params
    }
  }

  // Captura archivos adjuntos
  onAdjunctFilesSelect(event: any): void {
    if (event.files) {
      this.adjunctFiles = Array.from(event.files);
    }
  }

  closeDialog(): void {
    this.showDialogChange.emit(false);
  }

  saveLesson(): void {
    if (this.frmInserLesson.invalid) {
      this.frmInserLesson.markAllAsTouched();
      return;
    }
    const currentType = this.frmInserLesson.get('type')?.value;
    if (currentType == 'VIDEO' && this.mainVideoFile.length == 0 && !this.isEditing) {
      this.toastMessage.toastError('Debe subir un video para este tipo de leccion');
      return;
    }

    const formValue = this.frmInserLesson.value;
    const lessonData: LessonFormPayload = {
      title: formValue.title,
      type: formValue.type,
      contenUrl: formValue.contenUrl || '',
      description: formValue.description || '',
      isFree: formValue.isFree ? 'true' : 'false',
      mainVideoFile: this.mainVideoFile.length > 0 ? (this.mainVideoFile as Blob[]) : undefined,
      adjunctFiles: this.adjunctFiles.length > 0 ? (this.adjunctFiles as Blob[]) : undefined
    };

    this.onSaveLesson.emit(lessonData);
    this.closeDialog();
  }
}
