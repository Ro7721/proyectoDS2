import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);

  // Signal reactivo para el estado del tema
  readonly isDark = signal(false);

  constructor() {
    if (this.isBrowser) {
      this.initTheme();
    }
  }

  private readonly initTheme(): void {
    const stored = localStorage.getItem('theme');
    if (stored) {
      // Preferencia guardada por el usuario
      this.applyTheme(stored === 'dark');
    } else {
      // Por defecto iniciar en modo claro
      this.applyTheme(false);
    }
  }

  toggleTheme(): void {
    const newValue = !this.isDark();
    if (this.isBrowser) {
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
    }
    this.applyTheme(newValue);
  }

  private readonly applyTheme(dark: boolean): void {
    this.isDark.set(dark);
    if (this.isBrowser) {
      if (dark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }
}
