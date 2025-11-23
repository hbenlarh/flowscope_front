import { Component } from '@angular/core';
import { Menu } from './menu/menu';
import { Logo } from './logo/logo';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-header',
  imports: [Menu, Logo, TranslateModule, CommonModule],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {
  currentLang: string;

  constructor(public translate: TranslateService) {
    translate.addLangs(['en', 'fr']);
    translate.setDefaultLang('en');

    const browserLang = translate.getBrowserLang();
    this.currentLang = browserLang?.match(/en|fr/) ? browserLang : 'en';
    translate.use(this.currentLang);
  }

  switchLanguage(lang: string) {
    this.translate.use(lang);
    this.currentLang = lang;
  }
}
