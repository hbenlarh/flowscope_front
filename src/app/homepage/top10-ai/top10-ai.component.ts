import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-top10-ai',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './top10-ai.component.html',
  styleUrls: ['./top10-ai.component.scss']
})
export class Top10AiComponent { }

