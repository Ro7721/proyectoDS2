import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { CourseGetall } from './course-getall';
import { Api } from '../../../../api/api';
import { MessageToast } from '../../../../message/message-toast';
import { ConfirmationService, MessageService } from 'primeng/api';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { findByTeacher, getAll1 } from '../../../../api/functions';
import { ChangeDetectorRef } from '@angular/core';

describe('CourseGetallComponent', () => {
  let component: CourseGetall;
  let fixture: ComponentFixture<CourseGetall>;
  let apiSpy: any;
  let messageToastSpy: any;
  let routerSpy: any;
  let authServiceSpy: any;
  let confirmationServiceSpy: any;

  beforeEach(async () => {
    apiSpy = {
      invoke: vi.fn().mockResolvedValue([])
    };
    
    messageToastSpy = {
      toastError: vi.fn(),
      toastSuccess: vi.fn()
    };
    
    routerSpy = {
      navigate: vi.fn()
    };
    
    authServiceSpy = {
      user: { idUser: 't1' }
    };

    confirmationServiceSpy = {
      confirm: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CourseGetall],
      providers: [
        provideRouter([]),
        { provide: Api, useValue: apiSpy },
        { provide: MessageToast, useValue: messageToastSpy },
        MessageService,
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy },
        { provide: ConfirmationService, useValue: confirmationServiceSpy },
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap: new Map() } } },
        ChangeDetectorRef
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CourseGetall);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load courses successfully', async () => {
    const mockCourses = [{ idCourse: '1', title: 'Course 1' }, { idCourse: '2', title: 'Course 2' }];
    apiSpy.invoke.mockImplementation((fn: any) => {
      if (fn === findByTeacher) return Promise.resolve({ data: mockCourses });
      if (fn === getAll1) return Promise.resolve([]);
      return Promise.resolve();
    });

    fixture.detectChanges(); // calls ngOnInit -> loadCourses and loadCategories
    await fixture.whenStable();

    expect(component.listCourses).toEqual(mockCourses);
    expect(component.filteredCourses).toEqual(mockCourses);
    expect(component.loading).toBeFalsy();
  });

  it('should handle error when loading courses', async () => {
    apiSpy.invoke.mockImplementation((fn: any) => {
      if (fn === findByTeacher) return Promise.reject(new Error('Network error'));
      if (fn === getAll1) return Promise.resolve([]);
      return Promise.resolve();
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(messageToastSpy.toastError).toHaveBeenCalledWith('Error al cargar cursos', 'Network error');
    expect(component.listCourses).toEqual([]);
  });

  it('should load categories successfully (array response)', async () => {
    const mockCategories = [{ idCategory: 'c1', name: 'Cat 1' }];
    apiSpy.invoke.mockImplementation((fn: any) => {
      if (fn === findByTeacher) return Promise.resolve({ data: [] });
      if (fn === getAll1) return Promise.resolve(mockCategories);
      return Promise.resolve();
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.categories).toEqual(mockCategories);
    expect(component.categoriesWithAll.length).toBe(2); // includes 'Todas'
  });

  it('should load categories successfully (string array response)', async () => {
    const mockCategories = [{ idCategory: 'c1', name: 'Cat 1' }];
    apiSpy.invoke.mockImplementation((fn: any) => {
      if (fn === findByTeacher) return Promise.resolve({ data: [] });
      if (fn === getAll1) return Promise.resolve(JSON.stringify(mockCategories));
      return Promise.resolve();
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.categories).toEqual(mockCategories);
  });

  it('should load categories successfully (data object response)', async () => {
    const mockCategories = [{ idCategory: 'c1', name: 'Cat 1' }];
    apiSpy.invoke.mockImplementation((fn: any) => {
      if (fn === findByTeacher) return Promise.resolve({ data: [] });
      if (fn === getAll1) return Promise.resolve({ data: mockCategories });
      return Promise.resolve();
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.categories).toEqual(mockCategories);
  });

  it('should handle error when loading categories', async () => {
    apiSpy.invoke.mockImplementation((fn: any) => {
      if (fn === findByTeacher) return Promise.resolve({ data: [] });
      if (fn === getAll1) return Promise.reject(new Error('Cat Error'));
      return Promise.resolve();
    });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(messageToastSpy.toastError).toHaveBeenCalledWith('Error al cargar categorías', 'Cat Error');
    expect(component.categories).toEqual([]);
  });

  it('should filter courses by search query', () => {
    component.listCourses = [
      { idCourse: '1', title: 'Angular Basics', description: 'desc', categoryName: 'cat' } as any,
      { idCourse: '2', title: 'React Basics', description: 'desc2', categoryName: 'cat2' } as any
    ];
    
    component.searchQuery = 'angular';
    component.onSearchInput();

    expect(component.filteredCourses.length).toBe(1);
    expect(component.filteredCourses[0].idCourse).toBe('1');
  });

  it('should filter courses by category', () => {
    component.categories = [{ idCategory: 'c1', name: 'cat' } as any];
    component.listCourses = [
      { idCourse: '1', title: 'Angular Basics', description: 'desc', categoryName: 'cat' } as any,
      { idCourse: '2', title: 'React Basics', description: 'desc2', categoryName: 'cat2' } as any
    ];
    
    component.onCategoryChange('c1');

    expect(component.selectedCategoryId).toBe('c1');
    expect(component.filteredCourses.length).toBe(1);
    expect(component.filteredCourses[0].idCourse).toBe('1');
  });

  it('should clear filters', () => {
    component.searchQuery = 'test';
    component.selectedCategoryId = 'c1';
    
    component.clearFilters();

    expect(component.searchQuery).toBe('');
    expect(component.selectedCategoryId).toBeNull();
  });

  it('should open course detail', () => {
    const course = { idCourse: '123' } as any;
    component.openCourseDetail(course);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/course-details', '123']);
  });

  it('should get level severity', () => {
    expect(component.getLevelSeverity('basico')).toBe('success');
    expect(component.getLevelSeverity('intermedio')).toBe('info');
    expect(component.getLevelSeverity('avanzado')).toBe('warn');
    expect(component.getLevelSeverity('unknown')).toBe('info'); // default
  });

  it('should get status severity', () => {
    expect(component.getStatusSeverity('publicado')).toBe('success');
    expect(component.getStatusSeverity('borrador')).toBe('secondary');
    expect(component.getStatusSeverity('pausado')).toBe('warn');
    expect(component.getStatusSeverity('unknown')).toBe('secondary'); // default
  });

  it('should format price', () => {
    expect(component.formatPrice(0)).toBe('Gratis');
    expect(component.formatPrice(10)).toContain('10');
  });
});
