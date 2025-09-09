import { Component } from '@angular/core';
import { Menu } from './menu/menu';
import { Logo } from './logo/logo';

@Component({
  selector: 'app-header',
  imports: [Menu,Logo],
  templateUrl: './header.html',
  styleUrl: './header.scss'
})
export class Header {

}
