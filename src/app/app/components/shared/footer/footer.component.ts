import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.css']
})
export class FooterComponent {
  currentYear: number = new Date().getFullYear();

  socialLinks = [
    { icon: 'instagram', url: 'https://www.instagram.com/am5tv_thetruth/', label: 'Instagram' },
    { icon: 'facebook', url: 'https://www.facebook.com/profile.php?id=61585729888763', label: 'Facebook' },
    { icon: 'twitter-x', url: 'https://x.com/AM5TV', label: 'X (Twitter)' },
    { icon: 'linkedin', url: 'https://www.linkedin.com/in/am5-tv-319478399/', label: 'LinkedIn' }
  ];
}