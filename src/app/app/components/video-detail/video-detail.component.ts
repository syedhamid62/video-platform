import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { VideoService } from '../../services/video.service';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';

@Component({
   selector: 'app-video-detail',
   standalone: true,
   imports: [CommonModule, TranslateModule, RouterModule, FormsModule],
   templateUrl: './video-detail.component.html',
   styleUrls: ['./video-detail.component.css']
})
export class VideoDetailComponent implements OnInit {
   video: any = null;
   videoStreamUrl: string = '';
   loading: boolean = true;
   relatedVideos: any[] = [];
   moreNews: any[] = [];

   // Interactions
   comments: any[] = [];
   newCommentText: string = '';
   isLoggedIn: boolean = false;

   constructor(
      private route: ActivatedRoute,
      private videoService: VideoService,
      private router: Router
   ) { }

   ngOnInit(): void {
      this.isLoggedIn = !!localStorage.getItem('token');
      // Subscribe to paramMap for navigation updates
      this.route.paramMap.subscribe(params => {
         const videoId = params.get('id');
         if (videoId) {
            this.loading = true;
            this.video = null;
            this.loadMainVideo(Number(videoId));
            this.loadComments(Number(videoId));
            this.loadRelatedList(Number(videoId));
            // Increment view count
            this.videoService.incrementView(Number(videoId)).subscribe();
            window.scrollTo(0, 0);
         }
      });
   }

   loadMainVideo(id: number) {
      this.videoService.getVideoById(id).subscribe({
         next: (data) => {
            this.video = data;
            this.videoStreamUrl = `http://localhost:8080/api/videos/${id}/stream`;
            this.loading = false;
         },
         error: (err) => {
            console.error('Failed to load video', err);
            this.loading = false;
         }
      });
   }

   loadComments(id: number) {
      this.videoService.getComments(id).subscribe({
         next: (data) => this.comments = data,
         error: (err) => console.error('Failed to load comments', err)
      });
   }

   postComment() {
      if (!this.newCommentText.trim() || !this.video) return;
      this.videoService.addComment(this.video.id, this.newCommentText).subscribe({
         next: () => {
            this.newCommentText = '';
            this.loadComments(this.video.id);
         },
         error: (err) => alert('Failed to post comment')
      });
   }

   likeVideo() {
      if (!this.isLoggedIn) {
         this.router.navigate(['/login']);
         return;
      }
      // Determine URL based on current state (this logic should ideally be robust with backend returning "liked" status)
      // For now, simple optimistic UI or just call like endpoint
      this.videoService.likeVideo(this.video.id).subscribe({
         next: () => {
            this.video.likesCount++;
            this.video.likedByCurrentUser = true;
         }
      });
   }

   shareVideo() {
      this.videoService.incrementShare(this.video.id).subscribe();
      // Copy link to clipboard
      navigator.clipboard.writeText(window.location.href).then(() => {
         alert('Link copied to clipboard!');
         this.video.shareCount = (this.video.shareCount || 0) + 1;
      });
   }

   reportVideo() {
      const reason = prompt("Please provide a reason for reporting this video:");
      if (reason) {
         this.videoService.reportVideo(this.video.id, reason).subscribe({
            next: () => alert('Report submitted successfully.'),
            error: () => alert('Failed to submit report.')
         });
      }
   }

   loadRelatedList(currentId: number) {
      // FORCE DUMMY DATA FOR UI VISIBILITY
      const dummyData = [];
      for (let i = 1; i <= 12; i++) {
         dummyData.push({
            id: 900 + i,
            title: `Sample News Story ${i}: Breaking Updates on Local Events`,
            thumbnailUrl: 'assets/placeholder-news.jpg',
            description: 'This is a sample description for the news story.',
            user: { username: 'AM5TV Reporter' },
            views: 1200 + (i * 50),
            createdAt: new Date().toISOString()
         });
      }

      this.relatedVideos = dummyData.slice(0, 5);
      this.moreNews = dummyData.slice(5, 11);
   }
}
