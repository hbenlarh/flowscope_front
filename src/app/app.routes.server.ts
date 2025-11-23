import { RenderMode, ServerRoute } from '@angular/ssr';
import { HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';

export const serverRoutes: ServerRoute[] = [
  {
    path: 'categories/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      const http = inject(HttpClient);
      try {
        // Fetch available categories to get their IDs
        const response = await http.get<{ categories: Array<{ category_id: number }> }>(
          'https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/category',
          { withCredentials: true }
        ).toPromise();
        
        // Return the category IDs as parameters for prerendering
        return response?.categories.map(category => ({ id: category.category_id.toString() })) || [];
      } catch (error) {
        console.error('Failed to fetch categories for prerendering:', error);
        // Return empty array if fetch fails
        return [];
      }
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
