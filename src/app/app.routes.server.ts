import { RenderMode, ServerRoute } from '@angular/ssr';

export const serverRoutes: ServerRoute[] = [
  // Authenticated admin routes - use CSR only
  {
    path: 'admin/**',
    renderMode: RenderMode.Client
  },
  // Authenticated user routes - use CSR only
  {
    path: 'user/**',
    renderMode: RenderMode.Client
  },
  // Auth routes - use CSR only
  {
    path: 'login',
    renderMode: RenderMode.Client
  },
  {
    path: 'register',
    renderMode: RenderMode.Client
  },
  {
    path: 'logout',
    renderMode: RenderMode.Client
  },
  // Dynamic routes that need API data - use Server rendering (on-demand)
  {
    path: 'categories/:id',
    renderMode: RenderMode.Server
  },
  {
    path: 'offers/:slug',
    renderMode: RenderMode.Server
  },
  // Static pages - prerender these
  {
    path: '',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'ai-categories',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'contact',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'privacy-policy',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'terms-conditions',
    renderMode: RenderMode.Prerender
  },
  {
    path: 'cookie-policy',
    renderMode: RenderMode.Prerender
  },
  // Default for any other routes - use server rendering
  {
    path: '**',
    renderMode: RenderMode.Server
  }
];
