import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-explore-potential',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './explore-potential.component.html',
  styleUrls: ['./explore-potential.component.scss']
})
export class ExplorePotentialComponent {
  cards = [
    { icon: 'bi-layers', titleKey: 'EXPLORE_POTENTIAL.CARDS.HUBSPOT.TITLE', descKey: 'EXPLORE_POTENTIAL.CARDS.HUBSPOT.DESC' },
    { icon: 'bi-newspaper', titleKey: 'EXPLORE_POTENTIAL.CARDS.NEWS.TITLE', descKey: 'EXPLORE_POTENTIAL.CARDS.NEWS.DESC' },
    { icon: 'bi-robot', titleKey: 'EXPLORE_POTENTIAL.CARDS.GPTS.TITLE', descKey: 'EXPLORE_POTENTIAL.CARDS.GPTS.DESC' },
    { icon: 'bi-youtube', titleKey: 'EXPLORE_POTENTIAL.CARDS.YOUTUBE.TITLE', descKey: 'EXPLORE_POTENTIAL.CARDS.YOUTUBE.DESC' },
    { icon: 'bi-star', titleKey: 'EXPLORE_POTENTIAL.CARDS.TOP100.TITLE', descKey: 'EXPLORE_POTENTIAL.CARDS.TOP100.DESC' },
    { icon: 'bi-film', titleKey: 'EXPLORE_POTENTIAL.CARDS.TUTORIALS.TITLE', descKey: 'EXPLORE_POTENTIAL.CARDS.TUTORIALS.DESC' },
    { icon: 'bi-book', titleKey: 'EXPLORE_POTENTIAL.CARDS.BLOG.TITLE', descKey: 'EXPLORE_POTENTIAL.CARDS.BLOG.DESC' },
    { icon: 'bi-grid-3x3-gap', titleKey: 'EXPLORE_POTENTIAL.CARDS.APPS.TITLE', descKey: 'EXPLORE_POTENTIAL.CARDS.APPS.DESC' },
    { icon: 'bi-emoji-smile', titleKey: 'EXPLORE_POTENTIAL.CARDS.HUGGING.TITLE', descKey: 'EXPLORE_POTENTIAL.CARDS.HUGGING.DESC' },
    { icon: 'bi-discord', titleKey: 'EXPLORE_POTENTIAL.CARDS.DISCORD.TITLE', descKey: 'EXPLORE_POTENTIAL.CARDS.DISCORD.DESC' },
    { icon: 'bi-briefcase', titleKey: 'EXPLORE_POTENTIAL.CARDS.JOBS.TITLE', descKey: 'EXPLORE_POTENTIAL.CARDS.JOBS.DESC' },
    { icon: 'bi-calendar-event', titleKey: 'EXPLORE_POTENTIAL.CARDS.AGENDA.TITLE', descKey: 'EXPLORE_POTENTIAL.CARDS.AGENDA.DESC' }
  ];
}
