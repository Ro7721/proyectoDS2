import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withFetch } from '@angular/common/http';
import { provideApiConfiguration } from './api/api-configuration';
import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { LucideAngularModule, BookOpen, TrendingUp, Award, Heart, LayoutDashboard, Library, PlusCircle, Users, BarChart, GraduationCap, Play, ChevronRight, Plus } from 'lucide-angular';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withFetch()),
    provideClientHydration(withEventReplay()),
    provideApiConfiguration('http://localhost:8080'),
    importProvidersFrom(LucideAngularModule.pick({ BookOpen, TrendingUp, Award, Heart, LayoutDashboard, Library, PlusCircle, Users, BarChart, GraduationCap, Play, ChevronRight, Plus }))
  ]
};
