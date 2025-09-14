import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface Category {
  category_id: number;
  name: string;
  description: string;
  container_id: number;
  is_active: boolean;
}

export interface Container {
  container_id: number;
  name: string;
  description: string;
  is_active: boolean;
  categories?: Category[]; // we’ll fill this manually
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private apiUrl = '/api/flowscope_core/category';

  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
    return this.http.get<{ categories: Category[] }>(this.apiUrl, { withCredentials: true })
      .pipe(
        map(response => response.categories) // extract the array
      );
  }
}
