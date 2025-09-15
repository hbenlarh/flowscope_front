import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth';
import { UserDataService } from '../../services/userdata.service';

@Component({
  selector: 'app-logout',
  standalone: true,
  template: '<div class="text-center p-5">Logging out...</div>',
})
export class Logout implements OnInit {
  constructor(
    private auth: AuthService,
    private router: Router,
    private userDataService: UserDataService
  ) {}

  ngOnInit() {
    // Call the logout API endpoint
    this.auth.logout().subscribe({
      next: () => {
        // Clear user data from the service
        this.userDataService.clearUser();
        // Redirect to home page
        this.router.navigate(['/']);
      },
      error: () => {
        // Even if API fails, clear local data and redirect
        this.userDataService.clearUser();
        this.router.navigate(['/']);
      }
    });
  }
}