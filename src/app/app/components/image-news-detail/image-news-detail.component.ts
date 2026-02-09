import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VideoService } from '../../services/video.service'; // Keep for other potential shared needs, or remove if unused
import { ImageNewsService } from '../../services/image-news.service'; // Import this
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
   selector: 'app-image-news-detail',
   standalone: true,
   imports: [CommonModule, TranslateModule, RouterModule, FormsModule],
   templateUrl: './image-news-detail.component.html',
   styleUrls: ['./image-news-detail.component.css']
})
export class ImageNewsDetailComponent implements OnInit {
   news: any = null;
   imageKeys: string[] = []; // Renamed from imageUrls to be clear these are keys/parts
   activeImageIndex: number = 0;
   loading: boolean = true;
   relatedNews: any[] = [];

   constructor(
      private route: ActivatedRoute,
      private videoService: VideoService, // Assuming VideoService might still be used for generic stuff, but ImageNewsService is key
      private imageNewsService: ImageNewsService,
      private router: Router
   ) { }

   ngOnInit(): void {
      this.route.paramMap.subscribe(params => {
         const id = params.get('id');
         if (id) {
            this.loadNews(Number(id));
            this.loadRelated();
            window.scrollTo(0, 0);
         }
      });
   }

   loadNews(id: number) {
      this.loading = true;
      this.imageNewsService.getImageNewsById(id).subscribe({
         next: (data) => {
            this.news = data;
            // The DB stores comma separated string.
            this.imageKeys = data.imageUrls ? data.imageUrls.split(',') : [];
            this.activeImageIndex = 0;
            this.loading = false;

            // Increment view count
            this.incrementView(id);
         },
         error: (err) => {
            console.error('Failed to load news', err);
            this.loading = false;
         }
      });
   }

   incrementView(id: number) {
      this.imageNewsService.incrementViewCount(id).subscribe({
         next: () => {
            // Update local view count for display immediately? 
            // Or let it be. simpler to just increment on server but if we want to show it:
            if (this.news) this.news.views = (this.news.views || 0) + 1;
         },
         error: (e) => console.error('Failed to increment view', e)
      });
   }

   // Helper to construct full URL
   getImageUrl(index: number): string {
      if (!this.news) return '';
      return this.imageNewsService.getImageUrl(this.news.id, index);
   }

   getThumbnailUrl(newsItem: any): string {
      return this.imageNewsService.getImageUrl(newsItem.id, 0);
   }

   setActiveImage(index: number) {
      this.activeImageIndex = index;
   }

   loadRelated() {
      // Fetch feed to show some other items
      this.imageNewsService.getFeed(0, 5).subscribe({
         next: (res: any) => {
            const list = res.content || res;
            this.relatedNews = list.filter((item: any) => item.id !== this.news?.id).slice(0, 5);
         },
         error: (err) => console.error(err)
      });
   }

   likeNews() {
      if (!this.news) return;
      this.imageNewsService.likeImageNews(this.news.id).subscribe({
         next: () => {
            this.news.likesCount = (this.news.likesCount || 0) + 1;
         },
         error: (err) => console.error('Failed to like', err)
      });
   }

   shareNews() {
      if (!this.news) return;

      // Copy link
      navigator.clipboard.writeText(window.location.href).then(() => {
         alert('Link copied to clipboard!');
      });

      // Increment share count
      this.imageNewsService.incrementShareCount(this.news.id).subscribe({
         next: () => {
            this.news.shareCount = (this.news.shareCount || 0) + 1;
         },
         error: (err) => console.error('Failed to share', err)
      });
   }
}
