import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LessonInsert, LessonFormPayload } from './lesson-insert';
import { ReactiveFormsModule, FormBuilder } from '@angular/forms';
import { MessageToast } from '../../../../message/message-toast';
import { SimpleChange } from '@angular/core';

describe('LessonInsertComponent', () => {
  let component: LessonInsert;
  let fixture: ComponentFixture<LessonInsert>;
  let mockToast: any;

  beforeEach(async () => {
    mockToast = {
      toastWarn: vi.fn(),
      toastSuccess: vi.fn(),
      toastError: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [LessonInsert, ReactiveFormsModule],
      providers: [
        { provide: MessageToast, useValue: mockToast }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LessonInsert);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate form and show error for title with numbers only', () => {
    const titleCtrl = component.frmInserLesson.controls['title'];
    titleCtrl.setValue('12345');
    expect(titleCtrl.hasError('noNumbers')).toBeTruthy();

    titleCtrl.setValue('Valid Title');
    expect(titleCtrl.hasError('noNumbers')).toBeFalsy();
  });

  it('should validate form and show error for description with whitespaces only', () => {
    const descCtrl = component.frmInserLesson.controls['description'];
    descCtrl.setValue('          ');
    expect(descCtrl.hasError('whitespaceOnly')).toBeTruthy();
  });

  it('should detect when field is invalid', () => {
    const titleCtrl = component.frmInserLesson.controls['title'];
    titleCtrl.setValue('');
    titleCtrl.markAsTouched();
    expect(component.isFieldInvalid('title')).toBeTruthy();
  });

  it('should reset form when lesson input is null on ngOnChanges', () => {
    component.lesson = null;
    component.ngOnChanges({
      lesson: new SimpleChange(undefined, null, false)
    });
    expect(component.frmInserLesson.get('type')?.value).toBe('VIDEO');
  });

  it('should populate form when lesson input is provided on ngOnChanges', () => {
    const mockLesson: LessonFormPayload = {
      title: 'Valid Lesson Title',
      description: 'Valid Lesson Description',
      type: 'PDF',
      isFree: 'true'
    };
    component.lesson = mockLesson;
    component.ngOnChanges({
      lesson: new SimpleChange(null, mockLesson, false)
    });
    expect(component.frmInserLesson.get('title')?.value).toBe('Valid Lesson Title');
    expect(component.frmInserLesson.get('type')?.value).toBe('PDF');
  });

  it('should clear files when switching type to PDF', () => {
    component.frmInserLesson.patchValue({ type: 'VIDEO' });
    component.mainVideoFile = [new File([''], 'video.mp4', { type: 'video/mp4' })];
    
    // Simulate type changes
    component.frmInserLesson.patchValue({ type: 'PDF' });
    fixture.detectChanges();
    
    expect(component.mainVideoFile.length).toBe(0);
  });

  it('should handle video selection and show toast warning on invalid file type', () => {
    const mockFile = new File([''], 'text.txt', { type: 'text/plain' });
    component.onVideoSelect({ files: [mockFile] });
    expect(mockToast.toastWarn).toHaveBeenCalled();
    expect(component.mainVideoFile.length).toBe(0);
  });

  it('should select valid video files', () => {
    const mockFile = new File([''], 'video.mp4', { type: 'video/mp4' });
    component.onVideoSelect({ files: [mockFile] });
    expect(component.mainVideoFile[0]).toBe(mockFile);
  });

  it('should clear selected video and adjunct files', () => {
    component.mainVideoFile = [new File([''], 'video.mp4')];
    component.clearVideo();
    expect(component.mainVideoFile.length).toBe(0);

    component.adjunctFiles = [new File([''], 'doc.pdf')];
    component.clearAdjunctFiles();
    expect(component.adjunctFiles.length).toBe(0);
  });

  it('should emit lessonSave event and reset fields on successful save', () => {
    let savedPayload: LessonFormPayload | undefined;
    component.lessonSave.subscribe((payload) => {
      savedPayload = payload;
    });

    component.frmInserLesson.patchValue({
      title: 'Valid Lesson Title',
      type: 'PDF',
      description: 'Valid Lesson Description containing more than ten chars',
      isFree: true
    });

    component.saveLesson();

    expect(savedPayload).toBeDefined();
    expect(savedPayload?.title).toBe('Valid Lesson Title');
    expect(savedPayload?.isFree).toBe('true');
  });
});
