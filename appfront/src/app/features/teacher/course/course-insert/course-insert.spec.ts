import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CourseInsert, noNumbers, noWhitespaceOnly } from './course-insert';
import { ReactiveFormsModule } from '@angular/forms';
import { Api } from '../../../../api/api';
import { MessageToast } from '../../../../message/message-toast';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { getAll1, createCourse, create } from '../../../../api/functions';
import { ChangeDetectorRef } from '@angular/core';

describe('CourseInsertComponent', () => {
  let component: CourseInsert;
  let fixture: ComponentFixture<CourseInsert>;
  let apiSpy: any;
  let messageToastSpy: any;
  let routerSpy: any;
  let authServiceSpy: any;

  beforeEach(async () => {
    apiSpy = {
      invoke: vi.fn().mockResolvedValue([]),
      invoke$Response: vi.fn().mockResolvedValue({})
    };
    
    messageToastSpy = {
      toastError: vi.fn(),
      toastSuccess: vi.fn(),
      toastWarn: vi.fn(),
      toastApiError: vi.fn()
    };
    
    routerSpy = {
      navigate: vi.fn()
    };
    
    authServiceSpy = {
      user: { idUser: 't1' }
    };

    window.confirm = vi.fn().mockReturnValue(true);

    await TestBed.configureTestingModule({
      imports: [ReactiveFormsModule, CourseInsert],
      providers: [
        { provide: Api, useValue: apiSpy },
        { provide: MessageToast, useValue: messageToastSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        ChangeDetectorRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CourseInsert);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  // Validators Tests
  describe('Validators', () => {
    it('noNumbers should return error if only numbers', () => {
      const validator = noNumbers();
      expect(validator({ value: '123' } as any)).toEqual({ noNumbers: true });
      expect(validator({ value: 'abc' } as any)).toBeNull();
      expect(validator({ value: '123abc' } as any)).toBeNull();
      expect(validator({ value: '' } as any)).toBeNull();
    });

    it('noWhitespaceOnly should return error if only whitespace', () => {
      const validator = noWhitespaceOnly();
      expect(validator({ value: '   ' } as any)).toEqual({ whitespaceOnly: true });
      expect(validator({ value: ' a ' } as any)).toBeNull();
      expect(validator({ value: '' } as any)).toBeNull();
    });
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load categories successfully', async () => {
    const mockCategories = [{ idCategory: '1', name: 'Cat 1' }];
    apiSpy.invoke.mockResolvedValue(mockCategories);

    fixture.detectChanges(); // ngOnInit -> loadCategories
    await fixture.whenStable();

    expect(component.listCategories).toEqual(mockCategories);
  });

  it('should handle category load error', async () => {
    apiSpy.invoke.mockRejectedValue(new Error('error'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(messageToastSpy.toastError).toHaveBeenCalledWith('Error', 'No se pudieron cargar las categorías');
  });

  it('should handle cover input change', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    const event = { target: { files: [file] } } as any;
    
    component.onCoverInputChange(event);
    expect(component.coverImageFile).toBe(file);
  });

  it('should handle cover drop', () => {
    const file = new File([''], 'test.jpg', { type: 'image/jpeg' });
    const event = { 
      preventDefault: vi.fn(),
      dataTransfer: { files: [file] } 
    } as any;
    
    component.onCoverDrop(event);
    expect(event.preventDefault).toHaveBeenCalled();
    expect(component.coverImageFile).toBe(file);
  });

  it('should reject non-image drop', () => {
    const file = new File([''], 'test.pdf', { type: 'application/pdf' });
    const event = { 
      preventDefault: vi.fn(),
      dataTransfer: { files: [file] } 
    } as any;
    
    component.onCoverDrop(event);
    expect(messageToastSpy.toastError).toHaveBeenCalledWith('Archivo no válido', 'Solo se aceptan imágenes (PNG, JPG, WEBP)');
  });

  it('should reject large image', () => {
    // Create a mock file with size > 5MB
    const file = { size: 6 * 1024 * 1024, type: 'image/png' } as File;
    const event = { target: { files: [file] } } as any;
    
    component.onCoverInputChange(event);
    expect(messageToastSpy.toastWarn).toHaveBeenCalledWith('Imagen muy grande', 'El archivo no debe superar los 5 MB');
  });

  it('should open and close lesson dialog', () => {
    component.openAddLesson();
    expect(component.showLessonDialog).toBeTruthy();
    expect(component.editingIndex).toBeNull();
  });

  it('should open edit lesson', async () => {
    component.listLessons = [{ title: 'Lesson 1', saved: false } as any];
    component.openEditLesson(0);
    expect(component.showLessonDialog).toBeFalsy();
    
    await new Promise(resolve => setTimeout(resolve, 10)); // process setTimeout
    expect(component.showLessonDialog).toBeTruthy();
    expect(component.editingIndex).toBe(0);
  });

  it('should add a lesson', () => {
    component.handleLessonSave({ title: 'New Lesson' } as any);
    expect(component.listLessons.length).toBe(1);
    expect(component.listLessons[0].title).toBe('New Lesson');
    expect(component.showLessonDialog).toBeFalsy();
  });

  it('should edit a lesson', () => {
    component.listLessons = [{ title: 'Old Lesson', saved: true } as any];
    component.editingIndex = 0;
    
    component.handleLessonSave({ title: 'Updated Lesson' } as any);
    
    expect(component.listLessons[0].title).toBe('Updated Lesson');
    expect(component.listLessons[0].saved).toBeTruthy();
  });

  it('should remove a lesson', () => {
    component.listLessons = [{ title: 'Lesson 1', saved: false } as any];
    component.removeLesson(0);
    expect(component.listLessons.length).toBe(0);
  });

  it('should not save course if missing cover image', async () => {
    await component.saveCourse('DRAFT');
    expect(messageToastSpy.toastWarn).toHaveBeenCalledWith('Falta la portada', 'Selecciona una imagen de portada para continuar');
  });

  it('should not save course if form invalid', async () => {
    component.coverImageFile = new File([''], 'test.png', { type: 'image/png' });
    await component.saveCourse('DRAFT');
    expect(messageToastSpy.toastWarn).toHaveBeenCalledWith('Campos incompletos', 'Completa todos los campos obligatorios del curso');
  });

  it('should save course successfully', async () => {
    component.coverImageFile = new File([''], 'test.png', { type: 'image/png' });
    component.courseForm.patchValue({
      courseTitle: 'Valid Title',
      courseDescription: 'Valid Description',
      selectedCategoryId: '1',
      courseLevel: 'BASIC',
      coursePrice: 10
    });
    
    apiSpy.invoke$Response.mockResolvedValue({ body: JSON.stringify({ data: { idCourse: '123' } }) });

    await component.saveCourse('PUBLISHED');

    expect(apiSpy.invoke$Response).toHaveBeenCalledWith(createCourse, expect.any(Object));
    expect(component.courseCreated).toBeTruthy();
    expect(component.createdCourseId).toBe('123');
    expect(messageToastSpy.toastSuccess).toHaveBeenCalledWith('Curso publicado', '"Valid Title" fue publicado exitosamente');
  });

  it('should save course and lessons', async () => {
    component.coverImageFile = new File([''], 'test.png', { type: 'image/png' });
    component.courseForm.patchValue({
      courseTitle: 'Valid Title',
      courseDescription: 'Valid Description',
      selectedCategoryId: '1',
      courseLevel: 'BASIC',
      coursePrice: 10
    });
    component.listLessons = [{ title: 'Lesson 1', type: 'VIDEO', saved: false } as any];
    
    apiSpy.invoke$Response.mockImplementation((fn: any) => {
      if (fn === createCourse) return Promise.resolve({ body: JSON.stringify({ data: { idCourse: '123' } }) });
      if (fn === create) return Promise.resolve({});
      return Promise.resolve();
    });

    await component.saveCourse('DRAFT');

    expect(apiSpy.invoke$Response).toHaveBeenCalledWith(create, expect.any(Object));
    expect(component.listLessons[0].saved).toBeTruthy();
  });

  it('should add lesson to existing course', async () => {
    component.createdCourseId = '123';
    component.listLessons = [{ title: 'Lesson 2', type: 'VIDEO', saved: false } as any];
    
    apiSpy.invoke$Response.mockResolvedValue({});
    
    await component.addLessonToExistingCourse();

    expect(apiSpy.invoke$Response).toHaveBeenCalledWith(create, expect.any(Object));
    expect(component.listLessons[0].saved).toBeTruthy();
    expect(messageToastSpy.toastSuccess).toHaveBeenCalledWith('Lecciones guardadas', 'Todas las lecciones fueron subidas correctamente');
  });

  it('should handle go back', () => {
    // Empty form
    component.goBack();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/overview-teacher']);
    
    // Dirty form
    component.courseForm.markAsDirty();
    component.goBack();
    expect(window.confirm).toHaveBeenCalled();
    expect(routerSpy.navigate).toHaveBeenCalledTimes(2); // Initial + dirty
  });

  it('should return correct lesson type label', () => {
    expect(component.getLessonTypeLabel('VIDEO')).toBe('Video');
    expect(component.getLessonTypeLabel('PDF')).toBe('Documento');
    expect(component.getLessonTypeLabel('OTHER')).toBe('Recurso');
  });
});
