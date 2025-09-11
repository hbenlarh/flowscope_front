import { Component } from '@angular/core';
import { Button } from '../../shared/button/button';
import { UserDataService } from '../../services/userdata.service';  // ✅ service
import { Userdata } from '../../services/userdata.model';    
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-user-dashbord',
  imports: [Button,CommonModule],
  templateUrl: './user-dashbord.html',
  styleUrl: './user-dashbord.scss'
})
export class UserDashbord {


 user!: Userdata

  constructor(private userDataService: UserDataService) {}

ngOnInit() {
  this.user = this.userDataService.getUser();
}
}
