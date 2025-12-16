import { Component } from '@angular/core';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';


import { PopularPlatformsComponent } from './popular-platforms/popular-platforms.component';
import { ExplorePotentialComponent } from './explore-potential/explore-potential.component';
import { TrendingCategoriesComponent } from './trending-categories/trending-categories.component';
import { HeroIntroComponent } from './hero-intro/hero-intro.component';
import { GuideAboutComponent } from './guide-about/guide-about.component';
import { Top10AiComponent } from './top10-ai/top10-ai.component';
import { EnthusiastsComponent } from './enthusiasts/enthusiasts.component';
import { WhyFlowscopeComponent } from './why-flowscope/why-flowscope.component';
import { CommunityContributionComponent } from './community-contribution/community-contribution.component';
import { ClosingNoteComponent } from './closing-note/closing-note.component';
import { OffersListingComponent } from './offers-listing/offers-listing.component';

@Component({
  selector: 'app-homepage',
  standalone: true,
  imports: [CommonModule, FormsModule, Header, Footer, TranslateModule, PopularPlatformsComponent, ExplorePotentialComponent, HeroIntroComponent, GuideAboutComponent, Top10AiComponent, EnthusiastsComponent, WhyFlowscopeComponent, CommunityContributionComponent, ClosingNoteComponent, OffersListingComponent],
  templateUrl: './homepage.html',
  styleUrl: './homepage.scss'
})
export class Homepage {
  constructor() { }
}
