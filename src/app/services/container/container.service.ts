import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Category } from '../category/category';


export interface Container {
  container_id: number;
  name: string;
  description: string;
  is_active: boolean;
  categories?: Category[]; // we'll attach categories later
}


@Injectable({
  providedIn: 'root'
})
export class ContainerService {

  private apiUrl = '/api/flowscope_core/container';

  constructor(private http: HttpClient) {}

  getContainers(): Observable<Container[]> {
    return this.http
      .get<{ containers: Container[] }>(this.apiUrl, { withCredentials: true })
      .pipe(map(res => res.containers));
  }
}
