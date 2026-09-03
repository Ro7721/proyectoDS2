import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Estas vistas dependen de localStorage; el modo cliente evita mostrar el
    // login antes de que el navegador pueda restaurar y validar la sesión.
    path: 'auth/**',
    renderMode: RenderMode.Client
  },
  {
    path: 'dashboard/**',
    renderMode: RenderMode.Client
  },
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
