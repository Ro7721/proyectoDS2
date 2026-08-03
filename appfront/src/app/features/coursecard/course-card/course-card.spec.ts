import 'zone.js';
import 'zone.js/testing';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CourseCard } from './course-card';
import { CourseCardResponse } from '../../../models/course.model';
import { provideRouter } from '@angular/router';

describe('CourseCardComponent', () => {
  let component: CourseCard;
  let fixture: ComponentFixture<CourseCard>;

  const mockCourse: CourseCardResponse = {
    idCourse: '1',
    title: 'Test Course',
    description: 'Description',
    coverImage: 'image.png',
    teacherFullName: 'John Doe',
    categoryName: 'Programming',
    price: 150.0,
    level: 'BASIC',
    status: 'DRAFT',
    totalLessons: 5
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CourseCard],
      providers: [
        provideRouter([])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CourseCard);
    component = fixture.componentInstance;
    component.course = mockCourse;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should return formatted price', () => {
    const formatted = component.formatPrice(100.5);
    expect(formatted).toMatch(/100[.,]50/);
  });

  it('should return Gratis for null or 0 price', () => {
    expect(component.formatPrice(0)).toBe('Gratis');
    expect(component.formatPrice(null)).toBe('Gratis');
    expect(component.formatPrice(undefined)).toBe('Gratis');
  });
});
