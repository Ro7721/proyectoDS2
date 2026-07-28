import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private platformId = inject(PLATFORM_ID);
  private isBrowser = isPlatformBrowser(this.platformId);

  // Signal reactivo para el estado del tema
  readonly isDark = signal(false);

  constructor() {
    if (this.isBrowser) {
      this.initTheme();
    }
  }

  private initTheme(): void {
    const stored = localStorage.getItem('theme');
    if (stored) {
      // Preferencia guardada por el usuario
      this.applyTheme(stored === 'dark');
    } else {
      // Seguir la preferencia del sistema operativo
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.applyTheme(prefersDark);

      // Escuchar cambios del OS en tiempo real
      window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
        // Solo si el usuario no ha elegido manualmente
        if (!localStorage.getItem('theme')) {
          this.applyTheme(e.matches);
        }
      });
    }
  }

  toggleTheme(): void {
    const newValue = !this.isDark();
    if (this.isBrowser) {
      localStorage.setItem('theme', newValue ? 'dark' : 'light');
    }
    this.applyTheme(newValue);
  }

  private applyTheme(dark: boolean): void {
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
