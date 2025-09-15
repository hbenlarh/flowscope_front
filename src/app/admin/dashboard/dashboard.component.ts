import { Component } from '@angular/core';
import { Footer } from '../../shared/footer/footer';
import { UserDataService } from '../../services/userdata.service';  // ✅ service
import { Userdata } from '../../services/userdata.model';    
import { Menu } from '../menu/menu';
@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [Footer,Menu],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent {
user: Userdata | null = null;
  
  // Simple stats object used by the dashboard template
  stats: { users: number; containers: number; categories: number; offers: number } = {
    users: 0,
    containers: 0,
    categories: 0,
    offers: 0
  };

  constructor(private userDataService: UserDataService) {}

ngOnInit() {
  this.user = this.userDataService.getUser();
}
}
