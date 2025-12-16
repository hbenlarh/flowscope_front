import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-hero-intro',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './hero-intro.component.html',
  styleUrls: ['./hero-intro.component.scss']
})
export class HeroIntroComponent { }

