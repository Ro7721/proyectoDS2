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

import { VideoPreviewComponent } from '../shared/video-preview/video-preview';

export interface LessonForm {
  title: string;
  type: string;
  contenUrl: string;
  description: string;
  lessonOrder: number;
  isFree: boolean;
  files: File[];
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
    VideoPreviewComponent
  ],
  templateUrl: './lesson-insert.html',
  styleUrl: './lesson-insert.css',
})
export class LessonInsert implements OnInit, OnChanges {
  @Input() lesson: LessonForm | null = null;
  @Input() showDialog: boolean = false;
  @Input() isEditing: boolean = false;

  @Output() showDialogChange = new EventEmitter<boolean>();
  @Output() onSaveLesson = new EventEmitter<LessonForm>();

  frmInserLesson: FormGroup;
  selectedFiles: File[] = [];

  lessonTypeOptions = [
    { label: 'Video', value: 'VIDEO' },
    { label: 'Documento', value: 'PDF' },
    { label: 'Texto', value: 'TEXT' }
  ];

  constructor(private fb: FormBuilder) {
    this.frmInserLesson = this.fb.group({
      title: ['', Validators.required],
      type: ['VIDEO', Validators.required],
      contenUrl: [''],
      description: [''],
      lessonOrder: [1, Validators.required],
      isFree: [false]
    });
  }

  ngOnInit(): void {
    this.updateFormWithLesson();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['lesson'] && this.lesson) {
      this.updateFormWithLesson();
    }
  }

  private updateFormWithLesson(): void {
    if (this.lesson) {
      this.frmInserLesson.patchValue({
        title: this.lesson.title,
        type: this.lesson.type,
        contenUrl: this.lesson.contenUrl,
        description: this.lesson.description,
        lessonOrder: this.lesson.lessonOrder,
        isFree: this.lesson.isFree
      });
      this.selectedFiles = [...this.lesson.files];
    } else {
      this.frmInserLesson.reset({
        type: 'VIDEO',
        lessonOrder: 1,
        isFree: false
      });
      this.selectedFiles = [];
    }
  }

  onLessonFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      this.selectedFiles = Array.from(input.files);
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

    const formValue = this.frmInserLesson.value;
    const lessonData: LessonForm = {
      title: formValue.title,
      type: formValue.type,
      contenUrl: formValue.contenUrl || '',
      description: formValue.description || '',
      lessonOrder: formValue.lessonOrder,
      isFree: formValue.isFree,
      files: this.selectedFiles
    };

    this.onSaveLesson.emit(lessonData);
    this.closeDialog();
  }
}
