import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-guide-about',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './guide-about.component.html',
  styleUrls: ['./guide-about.component.scss']
})
export class GuideAboutComponent { }

