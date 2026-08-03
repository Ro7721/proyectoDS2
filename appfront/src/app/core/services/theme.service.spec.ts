import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { PLATFORM_ID } from '@angular/core';

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    // Mock localStorage
    const store: { [key: string]: string } = {};
    const mockLocalStorage = {
      getItem: (key: string): string | null => {
        return key in store ? store[key] : null;
      },
      setItem: (key: string, value: string) => {
        store[key] = `${value}`;
      },
      clear: () => {
        for (const key in store) {
          delete store[key];
        }
      }
    };
    Object.defineProperty(window, 'localStorage', {
      value: mockLocalStorage,
      writable: true
    });

    // Clean document classes
    document.documentElement.className = '';
  });

  afterEach(() => {
    window.localStorage.clear();
  });

  it('should be created and init with light theme by default', () => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    
    expect(service).toBeTruthy();
    expect(service.isDark()).toBeFalsy();
    expect(document.documentElement.classList.contains('dark')).toBeFalsy();
  });

  it('should init with dark theme if stored in localStorage', () => {
    window.localStorage.setItem('theme', 'dark');
    
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    
    expect(service.isDark()).toBeTruthy();
    expect(document.documentElement.classList.contains('dark')).toBeTruthy();
  });

  it('should toggle theme from light to dark', () => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ThemeService);
    
    expect(service.isDark()).toBeFalsy();
    
    service.toggleTheme();
    
    expect(service.isDark()).toBeTruthy();
    expect(window.localStorage.getItem('theme')).toBe('dark');
    expect(document.documentElement.classList.contains('dark')).toBeTruthy();
  });

  it('should handle non-browser environments gracefully', () => {
    TestBed.configureTestingModule({
      providers: [
        { provide: PLATFORM_ID, useValue: 'server' }
      ]
    });
    service = TestBed.inject(ThemeService);
    
    // In server mode, initTheme is not called, so isDark remains false (the default value of the signal)
    expect(service.isDark()).toBeFalsy();

    // toggleTheme should still work but not access localStorage or document
    service.toggleTheme();
    expect(service.isDark()).toBeTruthy();
  });
});
