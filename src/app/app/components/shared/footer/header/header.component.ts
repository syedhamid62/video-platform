import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { VideoService } from '../../../../services/video.service';
import { UserService } from '../../../../services/user.service';
import { LanguageSelectorComponent } from '../../../../../shared/components/language-selector/language-selector.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-header',
  imports: [
    CommonModule,
    RouterLink,
    MatToolbarModule,
    MatMenuModule,
    MatIconModule,
    MatButtonModule,
    FormsModule,
    LanguageSelectorComponent,
    TranslateModule
  ],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Input() isLoggedIn = false;
  @Input() darkMode = false;
  @Output() toggleDarkMode = new EventEmitter<void>();
  @Output() logout = new EventEmitter<void>();
  currentUser: any = null;
  searchQuery = '';
  showSearch = false; // Add toggle for search overlay

  toggleSearch() {
    this.showSearch = !this.showSearch;
  }

  constructor(
    private authService: AuthService,
    private router: Router,
    private videoService: VideoService,
    private userService: UserService
  ) { }

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      this.currentUser = user;
    });
  }

  get isAdminLoggedIn(): boolean {
    return !!localStorage.getItem('adminToken');
  }


  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.router.navigate(['/search'], { queryParams: { q: this.searchQuery } });
      this.showSearch = false; // Close overlay on mobile if active
    }
  }

  // Auto-suggestion logic (fires on input change)
  onSearchInput(event: Event): void {
    const input = (event.target as HTMLInputElement).value;
    this.searchQuery = input;
    if (input.length > 2) {
      this.getSuggestions(input);
    } else {
      this.suggestions = [];
    }
  }
  suggestions: string[] = [];



  getSuggestions(query: string): void {
    // Fetch from backend or stub
    this.videoService.getSearchSuggestions(query).subscribe({
      next: (res: string[]) => {
        this.suggestions = res;  // e.g. ['puppy video', 'puppy training', etc.]
      },
      error: () => {
        this.suggestions = [];  // Fallback
      }
    });
  }

  selectSuggestion(suggestion: string): void {
    this.searchQuery = suggestion;
    this.suggestions = [];
    this.onSearch();
  }

  navigateToProfile(): void {
    this.router.navigate(['/profile']);
  }

  getProfileImage(): string {
    return this.userService.getProfilePictureUrl(this.currentUser?.profilePictureUrl);
  }
}