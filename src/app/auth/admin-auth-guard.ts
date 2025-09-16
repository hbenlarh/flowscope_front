import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthService } from './auth';
import { Observable, of } from 'rxjs';
import { switchMap, tap, catchError } from 'rxjs/operators';
import { Userdata } from '../services/userdata.model';
import { UserDataService } from '../services/userdata.service';

@Injectable({
  providedIn: 'root'
})
export class AdminGuard implements CanActivate {

  constructor(
    private auth: AuthService,
    private router: Router,
    private userDataService: UserDataService
  ) {}

  canActivate(): Observable<boolean> {
    const user = this.auth.getUser();

    if (user?.is_admin) {
      // 🔹 Save user in the service
      this.userDataService.setUser(user);
      return of(true);
    }

    return this.auth.fetchUser().pipe(
      tap(fetchedUser => {
        if (fetchedUser) {
          this.userDataService.setUser(fetchedUser); // 🔹 Save fetched user
        }
      }),
      switchMap(fetchedUser => {
        if (fetchedUser?.is_admin) {
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
