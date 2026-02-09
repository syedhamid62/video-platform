import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../app/services/auth.service';
import { VideoService } from '../app/services/video.service';
import { UserService } from '../app/services/user.service';
import { TranslateModule } from '@ngx-translate/core';

interface Video {
  id: number;
  title: string;
  thumbnailUrl: string;
  createdAt: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  views: number;
  likesCount: number;
  rejectionReason?: string;
  contentType?: 'VIDEO' | 'IMAGE';
}

interface User {
  id: string;
  username: string; // display username
  email: string;
  profilePictureUrl: string;
  firstName?: string;
  lastName?: string;
  bio?: string;
  contactNumber?: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    ReactiveFormsModule,
    RouterLink,
    TranslateModule
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  videos: Video[] = [];
  editMode = false;
  profileForm: FormGroup;

  constructor(
    private authService: AuthService,
    private videoService: VideoService,
    private userService: UserService,
    private fb: FormBuilder,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      username: ['', Validators.required],
      firstName: [''],
      lastName: [''],
      bio: ['']
    });
  }

  ngOnInit(): void {
    // Redirect if not logged in
    if (!this.authService.isLoggedIn) {
      this.router.navigate(['/login']);
      return;
    }

    this.loadUserProfile();
    this.loadUploadedVideos();
  }

  loadUserProfile(): void {
    this.userService.getCurrentUser().subscribe({
      next: (user) => {
        this.user = {
          ...user,
          username: user.displayUsername // Map backend 'displayUsername' to frontend 'username' if needed
        };
        if (this.user) {
          this.profileForm.patchValue({
            username: this.user.username,
            firstName: this.user.firstName,
            lastName: this.user.lastName,
            bio: this.user.bio
          });
        }
      },
      error: (err) => console.error('Error loading profile', err)
    });
  }

  getProfileImage(): string {
    return this.userService.getProfilePictureUrl(this.user?.profilePictureUrl);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.userService.uploadProfilePicture(file).subscribe({
        next: (response) => {
          if (this.user) {
            this.user.profilePictureUrl = response.profilePictureUrl;
            this.authService.updateCurrentUser({ profilePictureUrl: response.profilePictureUrl }); // Sync with Header
          }
          alert('Profile picture updated!');
        },
        error: (err) => alert('Failed to upload profile picture')
      });
    }
  }

  loadUploadedVideos(): void {
    if (!this.user?.id) return;

    this.videoService.getUserVideos(Number(this.user.id)).subscribe({
      next: (videos: any[]) => {
        this.videos = videos;
      },
      error: (err) => console.error('Error fetching videos', err)
    });
  }

  toggleEditMode(): void {
    this.editMode = !this.editMode;
  }

  showRejectionReason(reason: string | undefined): void {
    alert('Rejection Reason:\n' + (reason || 'No specific reason provided by admin.'));
  }

  saveProfile(): void {
    if (this.profileForm.valid && this.user) {
      const updatedData = {
        ...this.profileForm.value,
        displayUsername: this.profileForm.value.username // Map back to backend field name
      };

      this.userService.updateProfile(updatedData).subscribe({
        next: (user) => {
          this.user = {
            ...user,
            username: user.displayUsername
          };
          if (this.user) {
            this.authService.updateCurrentUser(this.user); // Sync with Header
          }
          this.editMode = false;
          alert('Profile updated successfully!');
        },
        error: (err) => alert('Failed to update profile')
      });
    }
  }

  deleteVideo(videoId: number): void {
    if (confirm('Are you sure you want to delete this video?')) {
      // Real backend call
      // this.videoService.deleteVideo(videoId).subscribe({
      //   next: () => {
      //     this.videos = this.videos.filter(v => v.id !== videoId);
      //     alert('Video deleted!');
      //   },
      //   error: () => alert('Failed to delete video')
      // });

      // Mock delete
      this.videos = this.videos.filter(v => v.id !== videoId);
      alert('Video deleted!');
    }
  }

  uploadNewVideo(): void {
    this.router.navigate(['/upload']);
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}