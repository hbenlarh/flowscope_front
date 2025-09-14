import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

export interface Userdata {
  full_name: string;
  email: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private user: Userdata | null = null;

  constructor(private http: HttpClient) {}

  private isBrowser(): boolean {
    return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
  }

  getUser(): Userdata | null {
    if (!this.user && this.isBrowser()) {
      const stored = localStorage.getItem('user');
      if (stored) {
        this.user = JSON.parse(stored);
      }
    }
    return this.user;
  }

  fetchUser(): Observable<Userdata | null> {
    return this.http.get<Userdata>('api/flowscope_core/client/me', { withCredentials: true })
      .pipe(
        tap(user => {
          this.user = user;
          if (this.isBrowser()) {
            localStorage.setItem('user', JSON.stringify(user));
          }
        }),
        catchError(() => {
          this.user = null;
          if (this.isBrowser()) {
            localStorage.removeItem('user');
          }
          return of(null);
        })
      );
  }

  logout() {
    this.user = null;
    if (this.isBrowser()) {
      localStorage.removeItem('user');
    }
  }
}
