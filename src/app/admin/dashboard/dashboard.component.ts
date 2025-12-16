import { Component, OnInit } from '@angular/core';
import { AdminFooter } from '../../shared/admin-footer/admin-footer';
import { UserDataService } from '../../services/userdata.service';
import { Userdata } from '../../services/userdata.model';
import { Menu } from '../menu/menu';
import { OfferService } from '../../services/offer/offer';
import { CategoryService, Category } from '../../services/category/category';
import { ContainerService, Container } from '../../services/container/container.service';
import { forkJoin } from 'rxjs';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { DashboardHeader } from '../../shared/dashboard-header/dashboard-header';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [AdminFooter, Menu, CommonModule, DashboardHeader],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  user: Userdata | null = null;
  loading = true;
  
  // Stats object with real data
  stats: { 
    users: number; 
    containers: number; 
    categories: number; 
    offers: number;
  } = {
    users: 0,
    containers: 0,
    categories: 0,
    offers: 0
  };

  constructor(
    private userDataService: UserDataService,
    private offerService: OfferService,
    private categoryService: CategoryService,
    private containerService: ContainerService,
    private http: HttpClient
  ) {}

  ngOnInit() {
    this.user = this.userDataService.getUser();
    this.loadDashboardData();
  }

  private loadDashboardData() {
    this.loading = true;
    
    forkJoin({
      offers: this.offerService.getOffers(),
      categories: this.categoryService.getCategories(),
      containers: this.containerService.getContainers(),
      users: this.http.get<any>('https://test1.jcloud-ver-jpe.ik-server.com/api/flowscope_core/client', { withCredentials: true })
    }).subscribe({
      next: ({ offers, categories, containers, users }) => {
        // Normalize users data (same logic as users admin page)
        const usersRaw = Array.isArray(users) ? users : (users?.clients || users?.items || users?.data || users?.results || []);
        
        // Update stats
        this.stats.offers = offers.length;
        this.stats.categories = categories.length;
        this.stats.containers = containers.length;
        this.stats.users = usersRaw.length;
        
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading dashboard data:', error);
        this.loading = false;
      }
    });
  }
}
