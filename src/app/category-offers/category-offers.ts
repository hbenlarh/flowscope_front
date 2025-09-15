import { Component } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { OfferService } from '../services/offer/offer';
import { CategoryService, Category } from '../services/category/category';
import { Offer } from '../services/models/offredata.model';

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

    this.offerService.getOffers().subscribe({
      next: (offers) => {
        this.offers = offers.filter(o => o.category_id === this.categoryId);
        this.filteredOffers = [...this.offers];
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load offers';
        this.loading = false;
      }
    });
  }

  onSearchChange() {
    const term = this.searchTerm.toLowerCase();
    this.filteredOffers = this.offers.filter(o =>
      !term || o.name.toLowerCase().includes(term) || o.description.toLowerCase().includes(term)
    );
  }
}


