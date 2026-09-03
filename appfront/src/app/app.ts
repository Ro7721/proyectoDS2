import { isPlatformBrowser } from '@angular/common';
import { Component, inject, PLATFORM_ID, signal, OnDestroy, OnInit } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
import { ToastModule } from "primeng/toast";
import { ConfirmDialogModule } from "primeng/confirmdialog";
import { AuthService } from './core/auth/auth.service';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, ToastModule, ConfirmDialogModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App implements OnInit, OnDestroy {
  protected readonly title = signal('appfront');
  private readonly platformId = inject(PLATFORM_ID);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  private readonly handlePageShow = (event: PageTransitionEvent): void => {
    if (!event.persisted || !this.authService.isAuthenticated()) return;

    // Al volver con el historial, BFCache puede conservar la vista antigua del
    // login. Sustituimos esa entrada inmediatamente sin recargar la aplicación.
    if (window.location.pathname.startsWith('/auth')) {
      void this.router.navigate(this.authService.getRoleHomeUrl(), { replaceUrl: true });
    }
  };

  ngOnInit(): void {
    if (!isPlatformBrowser(this.platformId)) {
      return;
    }

    window.addEventListener('pageshow', this.handlePageShow);
  }

  ngOnDestroy(): void {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('pageshow', this.handlePageShow);
    }
  }
}
