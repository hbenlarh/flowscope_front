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
    path: 'offers/:slug',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      const http = inject(HttpClient);
      try {
        // Fetch all offers to get their slugs
        const response = await http.get<{ items: Array<{ slug: string }> }>(
          'https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/offer?page_number=1&page_size=1000',
          { withCredentials: true }
        ).toPromise();
        
        return response?.items.map(offer => ({ slug: offer.slug })) || [];
      } catch (error) {
        console.error('Failed to fetch offers for prerendering:', error);
        return [];
      }
    }
  },
  {
    path: 'admin/offers/edit/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      const http = inject(HttpClient);
      try {
        // Fetch all offers to get their IDs
        const response = await http.get<{ items: Array<{ offer_id: number }> }>(
          'https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/offer?page_number=1&page_size=1000',
          { withCredentials: true }
        ).toPromise();
        
        return response?.items.map(offer => ({ id: offer.offer_id.toString() })) || [];
      } catch (error) {
        console.error('Failed to fetch offers for prerendering:', error);
        return [];
      }
    }
  },
  {
    path: 'user/editOffre/:id',
    renderMode: RenderMode.Prerender,
    getPrerenderParams: async () => {
      const http = inject(HttpClient);
      try {
        // Fetch all offers to get their IDs
        const response = await http.get<{ items: Array<{ offer_id: number }> }>(
          'https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/offer?page_number=1&page_size=1000',
          { withCredentials: true }
        ).toPromise();
        
        return response?.items.map(offer => ({ id: offer.offer_id.toString() })) || [];
      } catch (error) {
        console.error('Failed to fetch offers for prerendering:', error);
        return [];
      }
    }
  },
  {
    path: '**',
    renderMode: RenderMode.Prerender
  }
];
