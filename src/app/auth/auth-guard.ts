import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { AuthService } from './auth';
import { switchMap, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private auth: AuthService, private router: Router) {}

  canActivate(): Observable<boolean> {
    const user = this.auth.getUser();
    if (user) {
      return of(true); // already have user
    }

    // No user yet → try /me
    return this.auth.fetchUser().pipe(
      switchMap(user => {
        if (user) {
          return of(true);
        } else {
          this.router.navigate(['/login']);
          return of(false);
        }
      }),
      catchError(() => {
        // If API call fails, redirect to login
        this.router.navigate(['/login']);
        return of(false);
      })
    );
  }
}
