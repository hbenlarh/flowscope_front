import { Component } from '@angular/core';
import { UserDataService } from '../../services/userdata.service';  // ✅ service
import { Userdata } from '../../services/userdata.model';    
import { CommonModule } from '@angular/common';
import { RouterLink} from '@angular/router';
import { Footer } from '../../shared/footer/footer';
import { UserProfile } from '../user-profile/user-profile';
import { UserMenu } from '../user-menu/user-menu';


@Component({
  selector: 'app-user-dashbord',
  imports: [CommonModule, RouterLink,Footer,UserProfile,UserMenu],
  templateUrl: './user-dashbord.html',
  styleUrl: './user-dashbord.scss'
})
export class UserDashbord {

user: Userdata | null = null;

  constructor(private userDataService: UserDataService) {}

ngOnInit() {
  this.user = this.userDataService.getUser();
}


}
