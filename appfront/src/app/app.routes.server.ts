import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Rutas con parámetros dinámicos: se renderizan en el servidor bajo demanda.
    path: 'catalog/course/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/learning/course/:idCourse',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/course-details/:id',
    renderMode: RenderMode.Server
  },
  {
    // Todas las demás rutas se renderizan bajo demanda para que el build no dependa del API.
    path: '**',
    renderMode: RenderMode.Server
  }
];
