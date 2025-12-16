import { Component, OnInit } from '@angular/core';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-logo',
  standalone: true,
  imports: [RouterLink, CommonModule],
  templateUrl: './logo.html',
  styleUrl: './logo.scss'
})
export class Logo implements OnInit {
  isAdminPage: boolean = false;

  constructor(private router: Router) { }

  ngOnInit() {
    // Check initial route
    this.checkRoute(this.router.url);

    // Listen to route changes
    this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe((event: any) => {
        this.checkRoute(event.url);
      });
  }

  private checkRoute(url: string) {
    this.isAdminPage = url.startsWith('/admin');
  }

  get logoPath(): string {
    return this.isAdminPage ? '/assets/new_logoBindeye.png' : '/assets/new_logoBindeye.png';
  }
}
