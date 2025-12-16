import { Component, OnInit } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-admin-footer',
  standalone: true,
  imports: [TranslateModule, CommonModule],
  templateUrl: './admin-footer.html',
  styleUrl: './admin-footer.scss'
})
export class AdminFooter implements OnInit {
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


