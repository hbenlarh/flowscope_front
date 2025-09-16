import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Logo } from '../header/logo/logo';

@Component({
  selector: 'app-dashboard-header',
  standalone: true,
  imports: [CommonModule, Logo],
  templateUrl: './dashboard-header.html',
  styleUrl: './dashboard-header.scss'
})
export class DashboardHeader {
  @Input() title: string = 'Dashboard';
  @Input() subtitle: string = 'Welcome to your dashboard';
  @Input() showLogo: boolean = true;
}
