import { Component } from '@angular/core';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { forkJoin } from 'rxjs';
import { OfferService } from '../services/offer/offer';
import { CategoryService } from '../services/category/category';
import { Offer } from '../services/models/offredata.model';
import { CommonModule } from '@angular/common';


@Component({
  selector: 'app-homepage',
  imports: [Header,Footer,CommonModule],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss'
})
export class Homepage {

  offers: Offer[] = [];       // 👈 declare the property
  loading = true;
  error = '';

constructor(private offerService: OfferService,private CategoryService: CategoryService){}
  ngOnInit() {
    forkJoin({
      offers: this.offerService.getOffers(),
      categories: this.CategoryService.getCategories()
    }).subscribe(({ offers, categories }) => {
      this.offers = offers.map(offer => ({
        ...offer,
        category_name: categories.find(c => c.category_id === offer.category_id)?.name
      }));
    });
  }

}
