import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-menu',
  imports: [RouterLink, RouterLinkActive, TranslateModule],
  templateUrl: './menu.html',
  styleUrl: './menu.scss'
})
export class Menu {

}
