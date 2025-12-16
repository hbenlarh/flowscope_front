import { Component, OnInit } from '@angular/core';
import { UserDataService } from '../../services/userdata.service';
import { Userdata } from '../../services/userdata.model';    
import { CommonModule } from '@angular/common';
import { RouterLink} from '@angular/router';
import { AdminFooter } from '../../shared/admin-footer/admin-footer';
import { UserMenu } from '../user-menu/user-menu';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';
import { AuthService } from '../../auth/auth';


@Component({
  selector: 'app-user-dashbord',
  imports: [CommonModule, RouterLink,AdminFooter,UserMenu,DashboardHeader],
  templateUrl: './user-dashbord.html',
  styleUrl: './user-dashbord.scss'
})
export class UserDashbord implements OnInit {
  user: Userdata | null = null;

  constructor(
    private authService: AuthService,
    private userDataService: UserDataService
  ) {}

  ngOnInit() {
    // Try to get user from AuthService first
    this.user = this.authService.getUser();
    
    // If no user, try to fetch it
    if (!this.user) {
      this.authService.fetchUser().subscribe(user => {
        if (user) {
          this.user = user;
          this.userDataService.setUser(user);
        }
      });
    } else {
      // Update UserDataService with the user
      this.userDataService.setUser(this.user);
    }
  }
}
