import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { OfferService } from '../services/offer/offer';
import { Offer } from '../services/models/offredata.model';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';

@Component({
  selector: 'app-offer-detail',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule, Header, Footer],
  templateUrl: './offer-detail.component.html',
  styleUrls: ['./offer-detail.component.scss']
})
export class OfferDetailComponent implements OnInit {
  offer: Offer | null = null;
  relatedOffers: Offer[] = [];
  loading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private offerService: OfferService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      const slug = params['slug'];
      if (slug) {
        this.loadOfferDetails(slug);
      }
    });
  }

  loadOfferDetails(slug: string) {
    this.loading = true;
    this.error = '';

    this.offerService.getOfferBySlug(slug).subscribe({
      next: (offer: Offer) => {
        this.offer = offer;
        this.loading = false;
        
        // Load random related offers
        this.loadRandomRelatedOffers(offer.offer_id);
      },
      error: (error) => {
        console.error('Error loading offer details:', error);
        this.error = 'Offer not found';
        this.loading = false;
      }
    });
  }

  loadRandomRelatedOffers(currentOfferId: number) {
    // Load all offers and randomly select 3-4 different ones
    this.offerService.getOffers().subscribe({
      next: (offers: Offer[]) => {
        // Filter out current offer
        const otherOffers = offers.filter(o => o.offer_id !== currentOfferId);
        
        // Randomly shuffle and take first 4
        const shuffled = otherOffers.sort(() => Math.random() - 0.5);
        this.relatedOffers = shuffled.slice(0, 4);
      },
      error: (error) => {
        console.error('Error loading related offers:', error);
      }
    });
  }

  goBack() {
    this.router.navigate(['/']);
  }

  visitOffer() {
    if (this.offer?.url) {
      window.open(this.offer.url, '_blank');
    }
  }
}
