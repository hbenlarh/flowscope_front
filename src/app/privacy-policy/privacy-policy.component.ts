import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Header } from '../shared/header/header';
import { Footer } from '../shared/footer/footer';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-privacy-policy',
    standalone: true,
    imports: [CommonModule, Header, Footer, TranslateModule],
    templateUrl: './privacy-policy.component.html',
    styleUrl: './privacy-policy.component.scss'
})
export class PrivacyPolicyComponent { }
