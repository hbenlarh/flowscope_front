import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-terms-conditions',
    imports: [CommonModule, Header, Footer, TranslateModule],
    templateUrl: './terms-conditions.component.html',
    styleUrl: './terms-conditions.component.scss'
})
export class TermsConditionsComponent { }
