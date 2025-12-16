import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-closing-note',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './closing-note.component.html',
  styleUrls: ['./closing-note.component.scss']
})
export class ClosingNoteComponent { }

