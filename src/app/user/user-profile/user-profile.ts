import { Component } from '@angular/core';
import { Button } from '../../shared/button/button';
import { UserDataService } from '../../services/userdata.service';  // ✅ service
import { Userdata } from '../../services/userdata.model';    
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-user-profile',
  imports: [Button,CommonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile {
  user: Userdata | null = null;
  

  constructor(private auth: AuthService,private userDataService: UserDataService,   private router: Router) {}

ngOnInit() {
  this.user = this.auth.getUser();
}

logout() {
    // Clear backend session if you use cookies or JWT
    // Example: this.http.post('/api/logout', {}).subscribe();

    // Clear user data (local + memory)
    this.userDataService.clearUser();

    // Redirect to login page
    this.router.navigate(['/login']);
  }
}
