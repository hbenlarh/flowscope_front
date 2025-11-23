import { Component } from '@angular/core';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { forkJoin } from 'rxjs';
import { OfferService } from '../services/offer/offer';
import { CategoryService, Category } from '../services/category/category';
import { ContainerService, Container } from '../services/container/container.service';
import { Offer, PaginatedResponse, PaginationParams } from '../services/models/offredata.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
// import { RouterLink } from '@angular/router';


import { PopularPlatformsComponent } from './popular-platforms/popular-platforms.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer, TranslateModule, PopularPlatformsComponent],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss'
})
export class Homepage {

  offers: Offer[] = [];       // 👈 declare the property
  filteredOffers: Offer[] = []; // 👈 filtered offers
  categories: Category[] = []; // 👈 all categories
  containers: Container[] = []; // 👈 all containers
  loading = true;
  error = '';

  // Filter properties
  selectedCategoryId: number | null = null;
  searchTerm: string = '';

  // Pagination properties
  currentPage = 1;
  pageSize = 12;
  totalItems = 0;
  totalPages = 0;
  paginationInfo: PaginatedResponse<Offer> | null = null;

  // Make Math available in template
  Math = Math;

  constructor(private offerService: OfferService, private CategoryService: CategoryService, private containerService: ContainerService) { }
  ngOnInit() {
    this.loadOffers();
    this.loadCategoriesAndContainers();
  }

  loadOffers() {
    this.loading = true;
    this.error = '';

    const paginationParams: PaginationParams = {
      page_number: this.currentPage,
      page_size: this.pageSize
    };

    this.offerService.getOffersPaginated(paginationParams).subscribe({
      next: (response: PaginatedResponse<Offer>) => {
        this.paginationInfo = response;

        // Handle different response structures
        const items = response.items || response.offers || response.data || response.results || [];

        this.offers = (Array.isArray(items) ? items : []).map(offer => ({
          ...offer,
          category_name: this.categories.find(c => c.category_id === offer.category_id)?.name,
          // Add default values for new properties
          upvotes: Math.floor(Math.random() * 500), // Random upvotes for demo
          is_featured: Math.random() > 0.7, // 30% chance to be featured
          is_top: Math.random() > 0.8 // 20% chance to be top
        }));

        this.totalItems = response.total_items || response.total || items.length;
        this.totalPages = response.total_pages || Math.ceil(this.totalItems / this.pageSize);

        // Apply filters after loading offers
        this.applyFilters();
        this.loading = false;
      },
      error: (error) => {
        console.error('Error loading offers:', error);
        this.error = 'Failed to load offers. Please try again.';
        this.loading = false;
      }
    });
  }

  loadCategoriesAndContainers() {
    forkJoin({
      categories: this.CategoryService.getCategories(),
      containers: this.containerService.getContainers()
    }).subscribe(({ categories, containers }) => {
      this.categories = categories;
      this.containers = containers;
    });
  }

  onCategoryChange() {
    this.currentPage = 1; // Reset to first page when filtering
    this.applyFilters();
  }

  onSearchChange() {
    this.currentPage = 1; // Reset to first page when searching
    this.applyFilters();
  }

  applyFilters() {
    let filtered = [...this.offers];

    // Apply category filter
    if (this.selectedCategoryId !== null) {
      filtered = filtered.filter(offer => offer.category_id === this.selectedCategoryId);
    }

    // Apply search term filter
    if (this.searchTerm && this.searchTerm.trim()) {
      const searchLower = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(offer =>
        offer.name.toLowerCase().includes(searchLower) ||
        offer.description.toLowerCase().includes(searchLower) ||
        (offer.category_name && offer.category_name.toLowerCase().includes(searchLower))
      );
    }

    // Update pagination info for filtered results
    this.totalItems = filtered.length;
    this.totalPages = Math.ceil(this.totalItems / this.pageSize);

    // Reset to page 1 if current page is beyond available pages
    if (this.currentPage > this.totalPages && this.totalPages > 0) {
      this.currentPage = 1;
    }

    // Apply pagination to filtered results
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = startIndex + this.pageSize;
    this.filteredOffers = filtered.slice(startIndex, endIndex);
  }

  clearFilters() {
    this.selectedCategoryId = null;
    this.searchTerm = '';
    this.currentPage = 1;
    this.applyFilters();
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.applyFilters();
    }
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.goToPage(this.currentPage + 1);
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.goToPage(this.currentPage - 1);
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, this.currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(this.totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  }

}
