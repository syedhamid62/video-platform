import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { VideoService } from '../../services/video.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-search',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './search.component.html',
  styleUrl: './search.component.css'
})
export class SearchComponent implements OnInit {
  query: string = '';
  videos: any[] = [];
  loading: boolean = false;

  constructor(private route: ActivatedRoute, private videoService: VideoService) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.query = params['q'] || '';
      if (this.query) {
        this.performSearch();
      }
    });
  }

  performSearch() {
    this.loading = true;
    this.videoService.searchVideos(this.query).subscribe({
      next: (data: any) => {
        this.videos = data.content ? data.content : data;
        this.loading = false;
      },
      error: (err) => {
        console.error('Search failed', err);
        this.loading = false;
      }
    });
  }

  getThumbnailUrl(video: any): string {
    if (video.thumbnailUrl && video.thumbnailUrl.includes('placehold.co')) {
      return video.thumbnailUrl;
    }
    return `http://localhost:8080/api/videos/${video.id}/thumbnail`;
  }
}
