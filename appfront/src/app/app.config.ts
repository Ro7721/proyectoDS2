import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideApiConfiguration } from './api/api-configuration';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { LucideAngularModule, BookOpen, TrendingUp, Award, Heart, LayoutDashboard, Library, PlusCircle, Users, BarChart, GraduationCap, Play, ChevronRight, Plus, DollarSign } from 'lucide-angular';
import { environment } from './environments/environment';
import { MessageService } from 'primeng/api';
export const appConfig: ApplicationConfig = {
  providers: [
    MessageService,
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    provideApiConfiguration(environment.urlBase),
    importProvidersFrom(LucideAngularModule.pick({ BookOpen, TrendingUp, Award, Heart, LayoutDashboard, Library, PlusCircle, Users, BarChart, GraduationCap, Play, ChevronRight, Plus, DollarSign })),
  ]
};
