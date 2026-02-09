import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface User {
  id: string;
  username: string;
  profilePictureUrl: string;
}

interface Video {
  id: string | number;
  title: string;
  url: string;
  thumbnail?: string;
  description: string;
  views: number;
  duration: string;
  uploadDate: Date;           // ← renamed back to avoid 'date' error
  categories: string[];
  tags: string[];
  uploader: User;
  likes: number;
  likedByCurrentUser?: boolean;
}

interface Comment {
  id: string;
  text: string;
  user: User;
  date: Date;
}

@Component({
  selector: 'app-video-player',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink, TranslateModule],
  templateUrl: './video-player.component.html',
  styleUrls: ['./video-player.component.css']
})
export class VideoPlayerComponent implements OnInit {
  videoId: string | null = null;
  video: Video | null = null;
  likes = 0;
  comments: Comment[] = [];
  newComment = '';
  relatedVideos: Video[] = [];
  uploader: User | null = null;
  showFullDescription = false;
  currentUser: User | null = null;

  constructor(private route: ActivatedRoute, private translate: TranslateService) { }

  ngOnInit(): void {
    this.videoId = this.route.snapshot.paramMap.get('id');

    // Mock logged-in user (replace with real AuthService)
    this.currentUser = {
      id: 'user-123',
      username: 'Ashwin',
      profilePictureUrl: 'https://via.placeholder.com/50/007bff/ffffff?text=A'
    };

    this.loadVideo();
    this.loadRelatedVideos();
  }

  loadVideo(): void {
    // Mock data (replace with real API call later)
    this.video = {
      id: this.videoId || 'unknown',
      title: 'Telangana Politics Update - Latest News',
      url: 'https://www.w3schools.com/html/mov_bbb.mp4',
      thumbnail: 'https://via.placeholder.com/1280x720?text=Video+Thumbnail',
      description: 'Exclusive report on recent political developments in Telangana... '.repeat(10),
      views: 45820,
      duration: '04:32',
      uploadDate: new Date('2026-01-15'),
      categories: ['Politics', 'State', 'Government', 'Telangana'],
      tags: ['telangana', 'news', 'politics', 'government'],
      uploader: {
        id: 'uploader-001',
        username: 'AM5TV_News',
        profilePictureUrl: 'https://via.placeholder.com/50/ff5733/ffffff?text=AM5'
      },
      likes: 1240,
      likedByCurrentUser: false
    };

    this.likes = this.video.likes;
    this.comments = [
      {
        id: 'c1',
        text: 'Very informative! Thanks for the quick update.',
        user: { id: 'u101', username: 'RaviKumar', profilePictureUrl: 'https://via.placeholder.com/40' },
        date: new Date('2026-01-16T10:15:00')
      },
      {
        id: 'c2',
        text: 'This will change a lot for farmers in rural areas.',
        user: { id: 'u102', username: 'Srinivas', profilePictureUrl: 'https://via.placeholder.com/40' },
        date: new Date('2026-01-16T11:30:00')
      }
    ];
    this.uploader = this.video.uploader;
  }

  loadRelatedVideos(): void {
    this.relatedVideos = [
      {
        id: 'v2',
        title: 'Hyderabad Traffic Update - New Metro Line',
        url: 'https://via.placeholder.com/640x360?text=Related+1',
        thumbnail: 'https://via.placeholder.com/640x360?text=Related+1',
        description: 'Latest on Hyderabad metro expansion...',
        views: 32000,
        duration: '03:45',
        uploadDate: new Date('2026-01-18'),
        categories: ['Local', 'Traffic'],
        tags: ['hyderabad', 'metro', 'traffic'],
        uploader: { id: 'uploader-002', username: 'CityNews', profilePictureUrl: 'https://via.placeholder.com/40' },
        likes: 890,
        likedByCurrentUser: false
      },
      {
        id: 'v3',
        title: 'National Budget 2026 Highlights',
        url: 'https://via.placeholder.com/640x360?text=Related+2',
        thumbnail: 'https://via.placeholder.com/640x360?text=Related+2',
        description: 'Key points from Union Budget...',
        views: 78000,
        duration: '05:10',
        uploadDate: new Date('2026-01-22'),
        categories: ['National', 'Economy'],
        tags: ['budget', 'economy', 'india'],
        uploader: { id: 'uploader-003', username: 'IndiaToday', profilePictureUrl: 'https://via.placeholder.com/40' },
        likes: 4500,
        likedByCurrentUser: false
      }
    ];
  }

  toggleLike(): void {
    if (this.video) {
      this.video.likedByCurrentUser = !this.video.likedByCurrentUser;
      this.video.likes += this.video.likedByCurrentUser ? 1 : -1;
    }
  }

  addComment(): void {
    if (!this.newComment.trim()) return;
    if (!this.currentUser) {
      alert(this.translate.instant('VIDEO_PLAYER.LOGIN_TO_COMMENT'));
      return;
    }

    this.comments.push({
      id: 'c' + Date.now(),
      text: this.newComment,
      user: this.currentUser,
      date: new Date()
    });

    this.newComment = '';
  }

  share(): void {
    const link = window.location.href;
    navigator.clipboard.writeText(link).then(() => alert(this.translate.instant('VIDEO_PLAYER.LINK_COPIED')));
  }

  toggleReadMore(): void {
    this.showFullDescription = !this.showFullDescription;
  }

  get truncatedDescription(): string {
    const desc = this.video?.description || '';
    return this.showFullDescription ? desc : desc.slice(0, 300) + (desc.length > 300 ? '...' : '');
  }

  saveVideo(): void {
    alert(this.translate.instant('VIDEO_PLAYER.VIDEO_SAVED'));
  }

  reportVideo(): void {
    alert(this.translate.instant('VIDEO_PLAYER.VIDEO_REPORTED'));
  }
}