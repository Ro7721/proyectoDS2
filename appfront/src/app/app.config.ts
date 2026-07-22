import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { provideApiConfiguration } from './api/api-configuration';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { LucideAngularModule, BookOpen, TrendingUp, Award, Heart, LayoutDashboard, Library, PlusCircle, Users, BarChart, GraduationCap, Play, ChevronRight, Plus, DollarSign, Clock } from 'lucide-angular';
import { environment } from './environments/environment';
import { MessageService, ConfirmationService } from 'primeng/api';
import { tokenInterceptor } from './core/auth/token.interceptor';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { providePrimeNG } from 'primeng/config';
import Aura from '@primeuix/themes/aura';
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    providePrimeNG({
      theme: {
        preset: Aura
      }
    }),
    MessageService,
    ConfirmationService,
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch(), withInterceptors([tokenInterceptor])),
    provideClientHydration(withEventReplay()),
    provideApiConfiguration(environment.urlBase),
    importProvidersFrom(LucideAngularModule.pick({ BookOpen, TrendingUp, Award, Heart, LayoutDashboard, Library, PlusCircle, Users, BarChart, GraduationCap, Play, ChevronRight, Plus, DollarSign, Clock })),

  ]
};
