import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { VideoService } from '../../app/services/video.service';
import { forkJoin, Subscription, interval } from 'rxjs';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule],
  templateUrl: './news.component.html',
  styleUrls: ['./news.component.css']
})
export class NewsComponent implements OnInit, OnDestroy {
  newsItems: any[] = [];
  filteredVideos: any[] = [];
  ads: any[] = [];

  // For swapping effect (carousel)
  currentImageIndexes: { [key: number]: number } = {};
  carouselSubscription?: Subscription;

  // Filters
  selectedScope: 'india' | 'global' = 'global';
  selectedCategory: string = 'all';
  selectedType: 'all' | 'video' | 'image' = 'all';

  constructor(private videoService: VideoService, private route: ActivatedRoute) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.selectedType = params['type'] || 'all';
      this.fetchNews();
    });
    this.loadAds();

    // Auto-swap images every 3 seconds for image news with multiple images
    this.carouselSubscription = interval(3000).subscribe(() => {
      this.autoSwapImages();
    });
  }

  ngOnDestroy(): void {
    if (this.carouselSubscription) {
      this.carouselSubscription.unsubscribe();
    }
  }

  fetchNews(): void {
    // Fetch both videos and image news
    forkJoin({
      videos: this.videoService.getAllVideos(),
      imageNews: this.videoService.getImageNewsFeed()
    }).subscribe({
      next: (result: any) => {
        const videos = result.videos.content ? result.videos.content : result.videos;
        const imageNews = result.imageNews.content ? result.imageNews.content : result.imageNews;

        // Process imageNews to split comma-separated URLs
        const processedImageNews = imageNews.map((news: any) => {
          return {
            ...news,
            isImageNews: true,
            urls: news.imageUrls ? news.imageUrls.split(',') : []
          };
        });

        const processedVideos = videos.map((v: any) => ({ ...v, isImageNews: false }));

        // Combine and sort by date
        this.newsItems = [...processedVideos, ...processedImageNews].sort((a, b) => {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        });

        // Initialize carousel indexes
        this.newsItems.forEach(item => {
          if (item.isImageNews) {
            this.currentImageIndexes[item.id] = 0;
          }
        });

        this.applyFilters();
      },
      error: (err: any) => {
        console.error('Failed to load news', err);
        this.newsItems = [];
      }
    });
  }

  autoSwapImages() {
    this.filteredVideos.forEach(item => {
      if (item.isImageNews && item.urls && item.urls.length > 1) {
        const nextIndex = (this.currentImageIndexes[item.id] + 1) % item.urls.length;
        this.currentImageIndexes[item.id] = nextIndex;
      }
    });
  }

  applyFilters() {
    this.filteredVideos = this.newsItems.filter(item => {
      // Logic for filtering by category
      if (this.selectedCategory !== 'all') {
        const itemCats = item.categories;
        let catsArr: string[] = [];
        if (typeof itemCats === 'string') {
          try {
            catsArr = JSON.parse(itemCats);
          } catch {
            catsArr = itemCats.split(',');
          }
        } else if (Array.isArray(itemCats)) {
          catsArr = itemCats;
        }

        if (!catsArr.includes(this.selectedCategory)) return false;
      }

      // Logic for filtering by scope (location)
      // Check if item.location includes selected scope name roughly
      if (this.selectedScope === 'india') {
        if (!(item.location && item.location.toLowerCase().includes('india'))) return false;
      }

      // Logic for filtering by type
      if (this.selectedType === 'video' && item.isImageNews) return false;
      if (this.selectedType === 'image' && !item.isImageNews) return false;

      return true;
    });
    this.loadAds();
  }

  setScope(scope: 'india' | 'global') {
    this.selectedScope = scope;
    this.applyFilters();
  }

  setCategory(category: string) {
    this.selectedCategory = category;
    this.applyFilters();
  }

  loadAds() {
    const allAds = JSON.parse(localStorage.getItem('ads') || '[]');
    this.ads = allAds.filter((ad: any) => {
      if (this.selectedScope !== ad.scope) return false;
      return true;
    }).slice(0, 4);

    if (this.ads.length < 2) {
      this.ads = [
        { thumbnail: 'https://placehold.co/640x360?text=Ad+1' },
        { thumbnail: 'https://placehold.co/640x360?text=Ad+2' }
      ];
    }
  }

  // Improved to handle both video thumbnails and image news URLs
  getDisplayUrl(item: any): string {
    if (item.isImageNews) {
      const urls = item.urls;
      const index = this.currentImageIndexes[item.id] || 0;
      return urls[index] || 'https://placehold.co/600x400?text=No+Image';
    } else {
      // For legacy videos
      if (item.thumbnailUrl && item.thumbnailUrl.includes('placehold.co')) {
        return item.thumbnailUrl;
      }
      return `http://localhost:8080/api/videos/${item.id}/thumbnail`;
    }
  }
}