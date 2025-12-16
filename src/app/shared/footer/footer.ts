import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [RouterLink, TranslateModule, CommonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss'
})
export class Footer implements OnInit {
  constructor(private translate: TranslateService) {}

  ngOnInit() {
    // Ensure translations are initialized
    this.translate.addLangs(['en', 'fr']);
    
    if (!this.translate.currentLang) {
      this.translate.setDefaultLang('en');
      
      const browserLang = this.translate.getBrowserLang();
      const langToUse = browserLang?.match(/en|fr/) ? browserLang : 'en';
      this.translate.use(langToUse);
    }
  }
}
