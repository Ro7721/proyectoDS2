import { TestBed } from '@angular/core/testing';
import { LearningService } from './learning.service';
import { Api } from '../../api/api';
import { getCourseContent, saveProgress } from '../../api/functions';

describe('LearningService', () => {
  let service: LearningService;
  let mockApi: any;

  beforeEach(() => {
    mockApi = {
      invoke: vi.fn()
    };

    TestBed.configureTestingModule({
      providers: [
        LearningService,
        { provide: Api, useValue: mockApi }
      ]
    });
    service = TestBed.inject(LearningService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call getCourseContent and return data', async () => {
    const mockData = { data: { course: 'Angular 101' } };
    mockApi.invoke.mockResolvedValue(mockData);

    const result = await service.getCourseContent('course-1');

    expect(mockApi.invoke).toHaveBeenCalledWith(getCourseContent, { idCourse: 'course-1' });
    expect(result).toEqual({ course: 'Angular 101' });
  });

  it('should call getCourseContent and return response directly if data is undefined', async () => {
    const mockData = { course: 'Angular 102' };
    mockApi.invoke.mockResolvedValue(mockData);

    const result = await service.getCourseContent('course-2');

    expect(result).toEqual({ course: 'Angular 102' });
  });

  it('should call saveProgress', async () => {
    const mockEvent = { lessonId: 'lesson-1', progress: 50 };
    mockApi.invoke.mockResolvedValue(true);

    await service.saveProgress(mockEvent as any);

    expect(mockApi.invoke).toHaveBeenCalledWith(saveProgress, { body: mockEvent });
  });
});
