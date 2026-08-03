import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { MyCourses } from './my-courses';
import { Api } from '../../../../api/api';
import { MessageToast } from '../../../../message/message-toast';
import { Router } from '@angular/router';
import { AuthService } from '../../../../core/auth/auth.service';
import { getMyCourses, getCertificate } from '../../../../api/functions';
import { FormsModule } from '@angular/forms';

describe('MyCoursesComponent', () => {
  let component: MyCourses;
  let fixture: ComponentFixture<MyCourses>;
  let apiSpy: any;
  let messageToastSpy: any;
  let routerSpy: any;
  let authServiceSpy: any;

  beforeEach(async () => {
    apiSpy = {
      invoke: vi.fn()
    };

    messageToastSpy = {
      toastError: vi.fn(),
      toastSuccess: vi.fn()
    };

    routerSpy = {
      navigate: vi.fn()
    };

    authServiceSpy = {
      user: { firstName: 'John', surName: 'Doe', email: 'john@doe.com' }
    };

    await TestBed.configureTestingModule({
      imports: [MyCourses, FormsModule],
      providers: [
        { provide: Api, useValue: apiSpy },
        { provide: MessageToast, useValue: messageToastSpy },
        { provide: Router, useValue: routerSpy },
        { provide: AuthService, useValue: authServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MyCourses);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create and get studentName correctly', () => {
    expect(component).toBeTruthy();
    expect(component.studentName).toBe('John Doe');
  });

  it('should fallback to email if names are empty', () => {
    authServiceSpy.user = { firstName: '', surName: '', email: 'test@mail.com' };
    expect(component.studentName).toBe('test@mail.com');
  });

  it('should fallback to Estudiante if user is null', () => {
    authServiceSpy.user = null;
    expect(component.studentName).toBe('Estudiante');
  });

  it('should load courses successfully with array', async () => {
    const mockCourses = [
      { idCourse: '1', title: 'A Course', completed: true, totalProgress: 100, lastAccess: '2023-01-01' },
      { idCourse: '2', title: 'B Course', completed: false, totalProgress: 50, lastAccess: '2023-01-02' }
    ];
    apiSpy.invoke.mockResolvedValue(mockCourses);

    fixture.detectChanges(); // calls ngOnInit
    await fixture.whenStable();

    expect(component.courses).toEqual(mockCourses);
    expect(component.loading).toBeFalsy();
    expect(component.completedCount).toBe(1);
    fixture.detectChanges();

    expect(component.courses).toEqual(mockCourses);
  });

  it('should load courses successfully with envelope format', async () => {
    const mockCourses = [
      { idCourse: '1', title: 'A Course', completed: true, totalProgress: 100, lastAccess: '2023-01-01' }
    ];
    apiSpy.invoke.mockResolvedValue({ data: mockCourses });

    fixture.detectChanges();
    await fixture.whenStable();

    expect(component.courses).toEqual(mockCourses);
  });

  it('should show error toast if load courses fails', async () => {
    apiSpy.invoke.mockRejectedValue(new Error('Network issue'));

    fixture.detectChanges();
    await fixture.whenStable();

    expect(messageToastSpy.toastError).toHaveBeenCalledWith('Error al cargar los cursos: Network issue');
    expect(component.loading).toBeFalsy();
  });

  it('should filter courses by status IN_PROGRESS', () => {
    component.courses = [
      { idCourse: '1', title: 'A', completed: true, teacherFullName: '', totalProgress: 100, lastAccess: '2023-01-01' } as any,
      { idCourse: '2', title: 'B', completed: false, teacherFullName: '', totalProgress: 50, lastAccess: '2023-01-02' } as any
    ];
    component.setFilter('IN_PROGRESS');
    expect(component.filtered.length).toBe(1);
    expect(component.filtered[0].idCourse).toBe('2');
  });

  it('should sort courses by progress', () => {
    component.courses = [
      { idCourse: '1', title: 'A', totalProgress: 50, teacherFullName: '', completed: false, lastAccess: '2023-01-01' } as any,
      { idCourse: '2', title: 'B', totalProgress: 100, teacherFullName: '', completed: true, lastAccess: '2023-01-02' } as any
    ];
    component.sortBy = 'progress';
    component.applyFilters();

    expect(component.filtered[0].idCourse).toBe('2'); // 100 comes first
  });

  it('should sort courses alphabetically', () => {
    component.courses = [
      { idCourse: '1', title: 'Zebra', totalProgress: 50, teacherFullName: '', completed: false, lastAccess: '2023-01-01' } as any,
      { idCourse: '2', title: 'Alpha', totalProgress: 100, teacherFullName: '', completed: true, lastAccess: '2023-01-02' } as any
    ];
    component.sortBy = 'alpha';
    component.applyFilters();

    expect(component.filtered[0].idCourse).toBe('2'); // Alpha comes first
  });

  it('should filter courses by search query', () => {
    component.courses = [
      { idCourse: '1', title: 'Angular Basics', teacherFullName: 'John Doe', categoryName: 'Dev', completed: false, lastAccess: '2023-01-01', totalProgress: 0 } as any,
      { idCourse: '2', title: 'React Basics', teacherFullName: 'Jane Smith', categoryName: 'Dev', completed: false, lastAccess: '2023-01-01', totalProgress: 0 } as any
    ];
    component.searchQuery = 'angular';
    component.applyFilters();

    expect(component.filtered.length).toBe(1);
    expect(component.filtered[0].idCourse).toBe('1');
  });

  it('should format date', () => {
    const formatted = component.formatDate('2023-01-15T00:00:00Z');
    expect(formatted).toBeTruthy(); // format depends on locale, just check it exists
  });

  it('should navigate to explore courses', () => {
    component.exploreCourses();
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/catalog']);
  });

  it('should navigate to continue course', () => {
    const course = { idCourse: 'abc' } as any;
    component.continueCourse(course);
    expect(routerSpy.navigate).toHaveBeenCalledWith(['/dashboard/learning/course', 'abc']);
  });

  it('should open certificate modal and load data', async () => {
    const course = { idCourse: 'c1', title: 'Title', teacherFullName: 'Teacher', totalLessons: 10 } as any;
    const mockCertResponse = { data: { code: 'CERT123', issueDate: '2023-01-01' }, response: { type: 'success' } };

    apiSpy.invoke.mockResolvedValue(mockCertResponse);

    await component.openCertificate(course);

    expect(apiSpy.invoke).toHaveBeenCalledWith(getCertificate, { idCourse: 'c1' });
    expect(component.certificateData).toEqual({ code: 'CERT123', issueDate: '2023-01-01' });
    expect(component.showCertificateModal).toBeTruthy();
    expect(component.selectedCourseName).toBe('Title');
  });

  it('should show error toast if certificate api returns error', async () => {
    const course = { idCourse: 'c1' } as any;
    const mockCertResponse = { response: { type: 'error', message: 'Failed to generate' } };

    apiSpy.invoke.mockResolvedValue(mockCertResponse);

    await component.openCertificate(course);

    expect(messageToastSpy.toastError).toHaveBeenCalled();
  });

  it('should show error toast if certificate api throws', async () => {
    const course = { idCourse: 'c1' } as any;
    apiSpy.invoke.mockRejectedValue(new Error('Network error'));

    await component.openCertificate(course);

    expect(messageToastSpy.toastError).toHaveBeenCalledWith('No se pudo cargar el certificado', 'Network error');
  });

  it('should clear filters', () => {
    component.searchQuery = 'Test';
    component.activeFilter = 'COMPLETED';
    component.sortBy = 'alpha';

    component.clearFilters();

    expect(component.searchQuery).toBe('');
    expect(component.activeFilter).toBe('ALL');
    expect(component.sortBy).toBe('recent');
  });
});
