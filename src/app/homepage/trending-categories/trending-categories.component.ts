import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-trending-categories',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './trending-categories.component.html',
  styleUrls: ['./trending-categories.component.scss']
})
export class TrendingCategoriesComponent {
  categories = [
    { icon: 'bi-camera-video', titleKey: 'TRENDING_CATEGORIES.ITEMS.VIDEO' },
    { icon: 'bi-pencil-square', titleKey: 'TRENDING_CATEGORIES.ITEMS.LOGO' },
    { icon: 'bi-megaphone', titleKey: 'TRENDING_CATEGORIES.ITEMS.MARKETING' },
    { icon: 'bi-gear-wide-connected', titleKey: 'TRENDING_CATEGORIES.ITEMS.AUTOMATION' },
    { icon: 'bi-image', titleKey: 'TRENDING_CATEGORIES.ITEMS.IMAGE' },
    { icon: 'bi-person-bounding-box', titleKey: 'TRENDING_CATEGORIES.ITEMS.FACESWAP' },
    { icon: 'bi-person-video2', titleKey: 'TRENDING_CATEGORIES.ITEMS.CHARACTERS' },
    { icon: 'bi-heart', titleKey: 'TRENDING_CATEGORIES.ITEMS.GIRLFRIEND' }
  ];
}
