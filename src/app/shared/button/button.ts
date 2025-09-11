import { Component,Input } from '@angular/core';

@Component({
  selector: 'app-button',
  imports: [],
  templateUrl: './button.html',
  styleUrl: './button.scss'
})
export class Button {
  @Input() label: string = 'Click Me'; // Button text
  @Input() disabled: boolean = false; // Disable button condition
  @Input() btnClass: string = 'btn btn-primary'; // Custom button classes
  @Input() type: string = 'submit'; // Default button type
}
