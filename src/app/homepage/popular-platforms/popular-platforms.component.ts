import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-popular-platforms',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './popular-platforms.component.html',
    styleUrls: ['./popular-platforms.component.scss']
})
export class PopularPlatformsComponent { }
