import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  {
    // Rutas con parámetros dinámicos: se renderizan en el servidor bajo demanda
    path: 'catalog/course/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'dashboard/learning/course/:idCourse',
    renderMode: RenderMode.Server
  },
  {
    // Todas las demás rutas: pre-renderizadas en build time
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
