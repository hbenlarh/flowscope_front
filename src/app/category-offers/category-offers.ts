import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { OfferService } from '../services/offer/offer';
import { CategoryService, Category } from '../services/category/category';
import { Offer, PaginatedResponse, PaginationParams } from '../services/models/offredata.model';

@Component({
  selector: 'app-category-offers',
  standalone: true,
  imports: [CommonModule, NgIf, NgFor, FormsModule, RouterModule, Header, Footer],
  templateUrl: './category-offers.html',
  styleUrl: './category-offers.scss'
})
export class CategoryOffers {
  categoryId!: number;
  category: Category | null = null;
  offers: Offer[] = [];
  filteredOffers: Offer[] = [];
  loading = true;
  error = '';
  searchTerm = '';
  
  // Pagination properties
  currentPage = 1;
  pageSize = 12;
  totalItems = 0;
  totalPages = 0;
  paginationInfo: PaginatedResponse<Offer> | null = null;
  
  // Make Math available in template
  Math = Math;

  constructor(
    private route: ActivatedRoute,
    private offerService: OfferService,
    private categoryService: CategoryService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.categoryId = Number(this.route.snapshot.paramMap.get('id'));

    this.categoryService.getCategories().subscribe({
      next: (categories) => {
        this.category = categories.find(c => c.category_id === this.categoryId) || null;
      },
      error: () => {}
    });

    this.loadOffers();
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
        const allOffers = Array.isArray(items) ? items : [];
        
        this.offers = allOffers.filter(o => o.category_id === this.categoryId);
        this.filteredOffers = [...this.offers];
        this.totalItems = response.total_items || response.total || allOffers.length;
        this.totalPages = response.total_pages || Math.ceil(this.totalItems / this.pageSize);
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load offers';
        this.loading = false;
      }
    });
  }

  onSearchChange() {
    this.currentPage = 1; // Reset to first page when searching
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


