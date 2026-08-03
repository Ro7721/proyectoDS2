import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Header } from './header';
import { ThemeService } from '../../core/services/theme.service';
import { signal } from '@angular/core';

describe('HeaderComponent', () => {
  let component: Header;
  let fixture: ComponentFixture<Header>;
  let themeServiceSpy: any;

  beforeEach(async () => {
    themeServiceSpy = {
      toggleTheme: vi.fn(),
      isDark: signal(false)
    };

    await TestBed.configureTestingModule({
      imports: [Header],
      providers: [
        { provide: ThemeService, useValue: themeServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(Header);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit menuToggle and change sidebarVisible on toggleSidebar', () => {
    vi.spyOn(component.menuToggle, 'emit');
    
    expect(component.sidebarVisible()).toBeFalsy();
    
    component.toggleSidebar();
    
    expect(component.sidebarVisible()).toBeTruthy();
    expect(component.menuToggle.emit).toHaveBeenCalled();
  });

  it('should toggle theme using ThemeService', () => {
    component.toggleTheme();
    expect(themeServiceSpy.toggleTheme).toHaveBeenCalled();
  });

  it('should return correct initials for empty user name', () => {
    component.userName = '   ';
    expect(component.initials).toBe('?');
  });

  it('should return correct initials for single word user name', () => {
    component.userName = 'John';
    expect(component.initials).toBe('J');
  });

  it('should return correct initials for multi-word user name', () => {
    component.userName = 'John Doe';
    expect(component.initials).toBe('JD');
    
    component.userName = 'Jane Maria Smith';
    expect(component.initials).toBe('JM');
  });
});
