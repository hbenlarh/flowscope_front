import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-cookie-policy',
  standalone: true,
  imports: [CommonModule, Header, Footer, TranslateModule],
  templateUrl: './cookie-policy.component.html',
  styleUrl: './cookie-policy.component.scss'
})
export class CookiePolicyComponent { }
