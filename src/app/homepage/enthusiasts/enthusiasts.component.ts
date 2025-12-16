import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-enthusiasts',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './enthusiasts.component.html',
  styleUrls: ['./enthusiasts.component.scss']
})
export class EnthusiastsComponent { }

