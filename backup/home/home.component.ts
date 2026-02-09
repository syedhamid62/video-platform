import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { VideoService } from '../../services/video.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  videos: any[] = [];
  trending: any[] = []; // You might want to fetch this too, or leave hardcoded for now
  recommendations: any[] = []; // Same here
  videoLimit: number = 7;

  // Filters
  selectedScope: 'india' | 'global' = 'global';
  selectedState: string | null = null;
  selectedDistrict: string | null = null;
  selectedCategory: string = 'all';

  // Categories Configuration
  allCategories = [
    { id: 'all', label: 'All' },
    { id: 'news', label: 'News' },
    { id: 'flash', label: 'Flash News' },
    { id: 'entertainment', label: 'Entertainment News' },
    { id: 'politics', label: 'Politics' },
    { id: 'viral', label: 'Viral' },
    { id: 'sports', label: 'Sports' },
    { id: 'crime', label: 'Crime' },
    { id: 'daily', label: 'Daily' },
    // New Categories
    { id: 'government', label: 'Government' },
    { id: 'global', label: 'Global' },
    { id: 'state', label: 'State' },
    { id: 'national', label: 'National' },
    { id: 'local', label: 'Local' },
    { id: 'election', label: 'Election' },
    { id: 'international', label: 'International' },
    { id: 'foreign-affairs', label: 'Foreign Affairs' },
    { id: 'local-metro', label: 'Local Metro' },
    { id: 'education', label: 'Education' },
    { id: 'religion', label: 'Religion' },
    { id: 'business', label: 'Business' },
    { id: 'economy', label: 'Economy' },
    { id: 'crime-justice', label: 'Crime & Justice' },
    { id: 'science-tech', label: 'Science & Tech' },
    { id: 'health-wellness', label: 'Health & Wellness' },
    { id: 'social-issues', label: 'Social Issues' },
    { id: 'lifestyle-beauty', label: 'Lifestyle & Beauty' },
    { id: 'traffic-weather', label: 'Traffic & Weather' },
    { id: 'environment', label: 'Environment' },
    { id: 'technology', label: 'Technology' },
    { id: 'culture-heritage', label: 'Culture & Heritage' },
    { id: 'finance', label: 'Finance' }
  ];

  // Logic for displaying limited categories + dropdown
  visibleCategoryCount = 10;

  get visibleCategories() {
    return this.allCategories.slice(0, this.visibleCategoryCount);
  }

  get moreCategories() {
    return this.allCategories.slice(this.visibleCategoryCount);
  }

  // Districts (full list)
  private districts: { [key: string]: string[] } = {
    'Andhra Pradesh': [
      'Alluri Sitarama Raju', 'Anakapalli', 'Anantapur', 'Annamayya', 'Bapatla', 'Chittoor',
      'Dr. B. R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur', 'Kakinada', 'Krishna',
      'Kurnool', 'Nandyal', 'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam',
      'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Srikakulam', 'Tirupati', 'Visakhapatnam',
      'Vizianagaram', 'West Godavari', 'YSR Kadapa'
    ],
    'Telangana': [
      'Adilabad', 'Bhadradri Kothagudem', 'Hanumakonda', 'Hyderabad', 'Jagtial', 'Jangaon',
      'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam',
      'Kumuram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak',
      'Medchal–Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal',
      'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet',
      'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
    ]
  };

  // Ads (fetched from localStorage)
  ads: any[] = [];

  constructor(private videoService: VideoService) { }

  ngOnInit(): void {
    this.loadAds();
    this.loadVideos();
    this.shuffleAds();
    console.log('Sidebar Ad Images:', this.sidebarAdImages);
  }

  shuffleAds() {
    for (let i = this.sidebarAdImages.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.sidebarAdImages[i], this.sidebarAdImages[j]] = [this.sidebarAdImages[j], this.sidebarAdImages[i]];
    }
  }

  // Sections for Home Page (Mocked grouping for UI demo)
  videoSections: { title: string; videos: any[] }[] = [];

  // ... [middle of file] ...



  loadVideos() {
    // Determine location string
    let locationParam = '';
    if (this.selectedDistrict) {
      locationParam = this.selectedDistrict;
    } else if (this.selectedState) {
      locationParam = this.selectedState;
    } else if (this.selectedScope === 'india') {
      locationParam = 'India';
      // If backend treats 'India' as strictly the string "India" then this is fine.
      // If 'India' implies all states, and videos have "StateName, India", then exact match "India" might fail.
      // But we used LIKE %location% query, so if video has "Hyderabad, India", searching "India" works.
    }

    this.videoService.getAllVideos(this.selectedCategory, locationParam).subscribe({
      next: (data: any) => {
        // Handle pagination response (data.content) or list (data)
        this.videos = data.content ? data.content : data;

        // If filtering, we might want to skip "organizeSections" and just show a grid, 
        // OR we adapt organizeSections to show the filtered results.
        // For now, let's keep organizeSections but if result is small, it will just cycle.
        // If the user wants specific behavior "if news is related to crime ... show that news",
        // the current organizeSections will basically put Crime news into "News Today", "India First" etc buckets.
        // This might be confusing. 
        // Better: If specific category/filter is active, Change UI mode or just show one section.
        this.organizeSections();

        // Re-populate news data (Sidebar/Image News) with the filtered results
        this.populateNewsData();
      },
      error: (err) => console.error('Failed to load videos', err)
    });
  }

  organizeSections() {
    // If a specific filter is active, show fewer sections or a single "Results" section
    if (this.selectedCategory !== 'all' || (this.selectedScope === 'india' && this.selectedState)) {
      this.videoSections = [{
        title: `LATEST IN ${this.selectedCategory !== 'all' ? this.selectedCategory.toUpperCase() : 'NEWS'}`,
        videos: this.videos
      }];
      return;
    }

    // Default View: Creating 6 mock sections
    const sectionTitles = [
      'NEWS TODAY', 'INDIA FIRST', 'BUSINESS TODAY',
      'TECH & GADGETS', 'ENTERTAINMENT', 'SPORTS 360'
    ];

    this.videoSections = sectionTitles.map((title, index) => {
      // Cyclic slicing not ideal if total videos < 3, but works for demo
      if (this.videos.length === 0) return { title, videos: [] };

      const start = (index * 3) % this.videos.length;
      let sectionVideos = this.videos.slice(start, start + 3);

      // Fill with existing videos if we run out (just for demo)
      if (sectionVideos.length < 3 && this.videos.length > 0) {
        // sectionVideos = [...sectionVideos, ...this.videos.slice(0, 3 - sectionVideos.length)];
        // Don't repeat if list is small, just show what we have
      }

      return {
        title: title,
        videos: sectionVideos
      };
    });
  }

  // Image News & Sidebar News (Dynamic from DB)
  imageNews: any[] = [];
  sidebarNews: any[] = [];

  // ...

  populateNewsData() {
    // 1. Populate "Image News" (Middle Section) - Take first 5 videos
    this.imageNews = this.videos.slice(0, 5).map(v => ({
      title: v.title,
      description: v.description,
      image: this.getThumbnailUrl(v),
      source: v.user?.username || 'AM5TV News', // Fallback source
      date: new Date(v.createdAt).toLocaleDateString() // Simple date format
    }));

    // 2. Populate "Sidebar News" - Take next videos (need ~13 items for the loop: 5*2 + 3*1 = 13)
    // We'll take slightly more to be safe
    const sidebarStartIndex = 5;
    this.sidebarNews = this.videos.slice(sidebarStartIndex, sidebarStartIndex + 20).map(v => ({
      title: v.title,
      image: this.getThumbnailUrl(v),
      source: v.user?.username || 'AM5TV'
    }));

    // If not enough videos, loop/duplicate to fill UI (Optional but good for demo)
    while (this.sidebarNews.length < 20 && this.sidebarNews.length > 0) {
      this.sidebarNews = [...this.sidebarNews, ...this.sidebarNews];
    }
  }

  // Filter methods
  setScope(scope: 'india' | 'global') {
    this.selectedScope = scope;
    this.selectedState = null;
    this.selectedDistrict = null;
    this.loadAds();
    this.loadVideos(); // Reload videos for scope change (if implemented in backend, for now 'india/global' might be just client side or needs backend param)
    // Actually, scope is just for ads and state/district visibility in current code, 
    // but if we want to filter by country, we should pass 'India' as location if scope is India.
  }

  setState(state: string) {
    this.selectedState = state;
    this.selectedDistrict = null;
    this.loadAds();
    this.loadVideos();
  }

  setDistrict(district: string) {
    this.selectedDistrict = district;
    this.loadAds();
    this.loadVideos();
  }

  setCategory(category: string) {
    this.selectedCategory = category;
    this.loadAds();
    this.loadVideos();
  }

  getDistricts(): string[] {
    return this.selectedState ? this.districts[this.selectedState] || [] : [];
  }

  chunkArray<T>(array: T[], size: number): T[][] {
    const result: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      result.push(array.slice(i, i + size));
    }
    return result;
  }

  // Load and filter ads from localStorage
  loadAds() {
    const allAds = JSON.parse(localStorage.getItem('ads') || '[]');
    this.ads = allAds.filter((ad: any) => {
      if (this.selectedScope !== ad.scope) return false;
      if (this.selectedScope === 'india' && this.selectedState && this.selectedState !== ad.state) return false;
      if (this.selectedDistrict && this.selectedDistrict !== ad.district) return false;
      return true;
    });

    // Fallback to sample ads if fewer than 2
    if (this.ads.length < 2) {
      this.ads = [
        { thumbnail: 'https://placehold.co/640x360?text=Ad+1' },
        { thumbnail: 'https://placehold.co/640x360?text=Ad+2' }
      ];
    }
  }

  // Sidebar Ads (Local Assets) - Renamed to avoid ad-blockers
  sidebarAdImages = [
    '/assets/images/content_images/img_1.jpg',
    '/assets/images/content_images/img_2.jpg',
    '/assets/images/content_images/img_3.jpg',
    '/assets/images/content_images/img_4.jpg',
    '/assets/images/content_images/img_5.jpg',
    '/assets/images/content_images/img_6.jpg',
    '/assets/images/content_images/img_7.jpg',
    '/assets/images/content_images/img_3.jpg' // Repeat to fill 8th slot
  ];

  getVideoStreamUrl(videoId: number): string {
    return `http://localhost:8080/api/videos/${videoId}/stream`;
  }

  getThumbnailUrl(video: any): string {
    // If it's a placeholder, use it directly (optimization)
    if (video.thumbnailUrl && video.thumbnailUrl.includes('placehold.co')) {
      return video.thumbnailUrl;
    }
    // Otherwise use backend proxy
    return `http://localhost:8080/api/videos/${video.id}/thumbnail`;
  }
}