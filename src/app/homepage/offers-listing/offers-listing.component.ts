import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { forkJoin } from 'rxjs';
import { OfferService } from '../../services/offer/offer';
import { CategoryService, Category } from '../../services/category/category';
import { ContainerService, Container } from '../../services/container/container.service';
import { Offer, PaginatedResponse, PaginationParams } from '../../services/models/offredata.model';

@Component({
  selector: 'app-offers-listing',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, TranslateModule],
  templateUrl: './offers-listing.component.html',
  styleUrls: ['./offers-listing.component.scss']
})
export class OffersListingComponent implements OnInit {
  offers: Offer[] = [];
  categories: Category[] = [];
  containers: Container[] = [];
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

  constructor(
    private offerService: OfferService,
    private categoryService: CategoryService,
    private containerService: ContainerService
  ) { }

  ngOnInit() {
    this.loadCategoriesAndContainers();
    this.loadOffers();
  }

  loadOffers() {
    this.loading = true;
    this.error = '';

    const paginationParams: PaginationParams = {
      page_number: this.currentPage,
      page_size: this.pageSize,
      search: this.searchTerm,
      category_id: this.selectedCategoryId || undefined
    };

    this.offerService.getOffersPaginated(paginationParams).subscribe({
      next: (response: PaginatedResponse<Offer>) => {
        this.paginationInfo = response;

        // Handle different response structures
        const items = response.items || response.offers || response.data || response.results || [];

        this.offers = (Array.isArray(items) ? items : [])
          .filter(offer => offer.is_visible !== false)
          .map(offer => ({
            ...offer,
            category_name: this.categories.find(c => c.category_id === offer.category_id)?.name,
            // Add default values for new properties
            upvotes: Math.floor(Math.random() * 500),
            is_featured: Math.random() > 0.7,
            is_top: Math.random() > 0.8
          }));

        this.totalItems = response.total_items || response.total || items.length;
        this.totalPages = response.total_pages || Math.ceil(this.totalItems / this.pageSize);

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
      categories: this.categoryService.getCategories(),
      containers: this.containerService.getContainers()
    }).subscribe(({ categories, containers }) => {
      this.categories = categories;
      this.containers = containers;
      // Refresh offers to map category names correctly if they loaded after offers
      if (this.offers.length > 0) {
        this.offers.forEach(offer => {
          offer.category_name = this.categories.find(c => c.category_id === offer.category_id)?.name;
        });
      }
    });
  }

  onCategoryChange() {
    this.currentPage = 1;
    this.loadOffers();
  }

  onSearchChange() {
    this.currentPage = 1;
    this.loadOffers();
  }

  clearFilters() {
    this.selectedCategoryId = null;
    this.searchTerm = '';
    this.currentPage = 1;
    this.loadOffers();
  }

  // Pagination methods
  goToPage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.loadOffers();
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

