import { ApplicationConfig, provideBrowserGlobalErrorListeners, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { LucideAngularModule, BookOpen, TrendingUp, Award, Heart, LayoutDashboard, Library, PlusCircle, Users, BarChart, GraduationCap, Play, ChevronRight, Plus } from 'lucide-angular';
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(withEventReplay()),
    importProvidersFrom(LucideAngularModule.pick({ BookOpen, TrendingUp, Award, Heart, LayoutDashboard, Library, PlusCircle, Users, BarChart, GraduationCap, Play, ChevronRight, Plus }))
  ]
};
