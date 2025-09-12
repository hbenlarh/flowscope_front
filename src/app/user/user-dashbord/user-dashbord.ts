import { Component } from '@angular/core';
import { UserDataService } from '../../services/userdata.service';  // ✅ service
import { Userdata } from '../../services/userdata.model';    
import { CommonModule } from '@angular/common';
import { RouterLink} from '@angular/router';
import { Footer } from '../../shared/footer/footer';
import { UserProfile } from '../user-profile/user-profile';


@Component({
  selector: 'app-user-dashbord',
  imports: [CommonModule, RouterLink,Footer,UserProfile],
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
