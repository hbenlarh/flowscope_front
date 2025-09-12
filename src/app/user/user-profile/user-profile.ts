import { Component } from '@angular/core';
import { Button } from '../../shared/button/button';
import { UserDataService } from '../../services/userdata.service';  // ✅ service
import { Userdata } from '../../services/userdata.model';    
import { CommonModule } from '@angular/common';
import { AuthService } from '../../auth/auth';


@Component({
  selector: 'app-user-profile',
  imports: [Button,CommonModule],
  templateUrl: './user-profile.html',
  styleUrl: './user-profile.scss'
})
export class UserProfile {
  user: Userdata | null = null;

  constructor(private auth: AuthService) {}

ngOnInit() {
  this.user = this.auth.getUser();
}
}
