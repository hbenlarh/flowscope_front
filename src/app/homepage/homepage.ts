import { Component } from '@angular/core';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { forkJoin } from 'rxjs';
import { OfferService } from '../services/offer/offer';
import { CategoryService, Category } from '../services/category/category';
import { ContainerService, Container } from '../services/container/container.service';
import { Offer } from '../services/models/offredata.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
// import { RouterLink } from '@angular/router';


@Component({
  selector: 'app-homepage',
  imports: [Header, Footer, CommonModule, FormsModule],
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

constructor(private offerService: OfferService,private CategoryService: CategoryService, private containerService: ContainerService){}
  ngOnInit() {
    forkJoin({
      offers: this.offerService.getOffers(),
      categories: this.CategoryService.getCategories(),
      containers: this.containerService.getContainers()
    }).subscribe(({ offers, categories, containers }) => {
      this.offers = offers.map(offer => ({
        ...offer,
        category_name: categories.find(c => c.category_id === offer.category_id)?.name,
        // Add default values for new properties
        upvotes: Math.floor(Math.random() * 500), // Random upvotes for demo
        is_featured: Math.random() > 0.7, // 30% chance to be featured
        is_top: Math.random() > 0.8 // 20% chance to be top
      }));
      this.categories = categories;
      this.containers = containers;
      this.filteredOffers = [...this.offers]; // Initialize filtered offers
      this.loading = false;
    });
  }

  onCategoryChange() {
    this.applyFilters();
  }

  onSearchChange() {
    this.applyFilters();
  }

  clearFilters() {
    this.selectedCategoryId = null;
    this.searchTerm = '';
    this.applyFilters();
  }

  private applyFilters() {
    this.filteredOffers = this.offers.filter(offer => {
      const matchesCategory = !this.selectedCategoryId || offer.category_id === this.selectedCategoryId;
      const matchesSearch = !this.searchTerm || 
        offer.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        offer.description.toLowerCase().includes(this.searchTerm.toLowerCase());
      
      return matchesCategory && matchesSearch;
    });
  }

}
