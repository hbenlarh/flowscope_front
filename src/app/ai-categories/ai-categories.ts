import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { ContainerService, Container } from '../services/container/container.service';
import { CategoryService, Category } from '../services/category/category';
import { OfferService } from '../services/offer/offer';
import { Offer } from '../services/models/offredata.model';
import { forkJoin } from 'rxjs';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-ai-categories',
  standalone: true,
  imports: [CommonModule, Header, Footer, RouterModule, FormsModule],
  templateUrl: './ai-categories.html',
  styleUrl: './ai-categories.scss'
})
export class AiCategories implements OnInit {
  containers: Container[] = [];
  filteredContainers: Container[] = [];
  loading = true;
  error = '';
  searchTerm: string = '';

  constructor(
    private containerService: ContainerService,
    private categoryService: CategoryService,
    private offerService: OfferService
  ) {}

  ngOnInit() {
    this.loading = true;

    forkJoin({
      containers: this.containerService.getContainers(),
      categories: this.categoryService.getCategories(),
      offers: this.offerService.getOffers()
    }).subscribe({
      next: ({ containers, categories, offers }) => {
        // Count offers per category
        const offerCountMap: { [categoryId: number]: number } = {};
        offers.forEach((offer: Offer) => {
          if (offer.category_id) {
            offerCountMap[offer.category_id] = (offerCountMap[offer.category_id] || 0) + 1;
          }
        });

        // Attach icon + count to categories
        const processedCategories = categories.map(category => ({
          ...category,
          icon: this.generateIconClass(category.name),
          count: String(offerCountMap[category.category_id] || 0)
        }));

        // Group categories by container
        this.containers = containers.map(container => ({
          ...container,
          categories: processedCategories.filter(
            category => category.container_id === container.container_id
          )
        }));

        // Initialize filtered containers
        this.filteredContainers = [...this.containers];
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load data';
        this.loading = false;
        console.error('Error loading data:', err);
      }
    });
  }

  /** Generate a fallback icon class based on category name */
  private generateIconClass(categoryName: string): string {
    return categoryName
      ? categoryName.toLowerCase().replace(/[^a-z0-9]/g, '-') 
      : 'default-icon';
  }

  /** Search for containers and categories */
  onSearchChange() {
    if (!this.searchTerm.trim()) {
      this.filteredContainers = [...this.containers];
      return;
    }

    const searchLower = this.searchTerm.toLowerCase().trim();
    
    this.filteredContainers = this.containers.map(container => {
      // Check if container name or description matches
      const containerMatches = 
        container.name.toLowerCase().includes(searchLower) ||
        (container.description && container.description.toLowerCase().includes(searchLower));

      // Filter categories within this container
      const filteredCategories = container.categories?.filter(category =>
        category.name.toLowerCase().includes(searchLower)
      ) || [];

      // If container matches or has matching categories, include it
      if (containerMatches || filteredCategories.length > 0) {
        return {
          ...container,
          categories: containerMatches ? (container.categories || []) : filteredCategories
        };
      }

      return null;
    }).filter(container => container !== null) as Container[];
  }

  /** Clear search */
  clearSearch() {
    this.searchTerm = '';
    this.filteredContainers = [...this.containers];
  }
}
