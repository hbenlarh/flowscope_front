import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-community-contribution',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './community-contribution.component.html',
  styleUrls: ['./community-contribution.component.scss']
})
export class CommunityContributionComponent { }

