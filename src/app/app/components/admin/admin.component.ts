import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule as GeneratedFormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, GeneratedFormsModule],
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.css']
})
export class AdminComponent implements OnInit {
  activeTab: 'videos' | 'image-news' | 'users' | 'reports' | 'all-content' = 'videos';
  pendingVideos: any[] = [];
  pendingImageNews: any[] = [];
  users: any[] = [];
  reports: any[] = [];
  allContent: any[] = [];

  constructor(private adminService: AdminService, private router: Router) { }

  ngOnInit(): void {
    this.fetchPendingVideos();
    this.fetchPendingImageNews();
    this.fetchUsers();
    this.fetchReports();
  }

  switchTab(tab: 'videos' | 'image-news' | 'users' | 'reports' | 'all-content'): void {
    this.activeTab = tab;
    if (tab === 'reports') this.fetchReports();
    if (tab === 'image-news') this.fetchPendingImageNews();
    if (tab === 'videos') this.fetchPendingVideos();
  }

  // --- Video Logic ---
  fetchPendingVideos(): void {
    this.adminService.getPendingVideos().subscribe({
      next: (videos) => this.pendingVideos = videos,
      error: (err) => {
        console.error('Error fetching videos', err);
        if (err.status === 401 || err.status === 403) {
          this.logout();
        }
      }
    });
  }

  approve(videoId: number): void {
    this.adminService.approveVideo(videoId).subscribe(() => {
      alert('Video approved via Admin API!');
      this.fetchPendingVideos();
    });
  }

  reject(videoId: number): void {
    const reason = prompt('Please enter the reason for rejection:');
    if (reason === null) return; // User cancelled
    if (!reason.trim()) {
      alert('Rejection reason is required.');
      return;
    }

    this.adminService.rejectVideo(videoId, reason).subscribe({
      next: () => {
        alert('Video rejected successfully.');
        this.fetchPendingVideos();
      },
      error: (err) => {
        console.error('Error rejecting video', err);
        alert('Failed to reject video.');
      }
    });
  }

  // --- Image News Logic ---
  fetchPendingImageNews(): void {
    this.adminService.getPendingImageNews().subscribe({
      next: (news) => {
        this.pendingImageNews = news.map(item => ({
          ...item,
          urls: item.imageUrls ? item.imageUrls.split(',') : []
        }));
      },
      error: (err) => {
        console.error('Error fetching image news', err);
      }
    });
  }

  approveImageNews(id: number): void {
    this.adminService.approveImageNews(id).subscribe(() => {
      alert('Image News approved!');
      this.fetchPendingImageNews();
    });
  }

  rejectImageNews(id: number): void {
    const reason = prompt('Please enter the reason for rejection:');
    if (reason === null) return;
    if (!reason.trim()) {
      alert('Rejection reason is required.');
      return;
    }

    this.adminService.rejectImageNews(id, reason).subscribe({
      next: () => {
        alert('Image News rejected successfully.');
        this.fetchPendingImageNews();
      },
      error: (err) => {
        console.error('Error rejecting image news', err);
        alert('Failed to reject image news.');
      }
    });
  }

  // --- User Logic ---
  fetchUsers(): void {
    if (this.searchQuery.trim()) {
      this.adminService.searchUsers(this.searchQuery).subscribe({
        next: (users) => this.users = users,
        error: (err) => console.error('Error searching users', err)
      });
    } else {
      this.getAllUsers();
    }
  }

  getAllUsers() {
    this.adminService.getAllUsers().subscribe({
      next: (users) => this.users = users,
      error: (err) => {
        console.error('Error fetching users', err);
        if (err.status === 401 || err.status === 403) {
          this.logout();
        }
      }
    });
  }

  searchQuery: string = '';

  onSearchUser() {
    this.fetchUsers();
  }

  toggleUserStatus(userId: number, currentStatus: boolean): void {
    const action = currentStatus ? 'Block' : 'Unblock';
    if (confirm(`Are you sure you want to ${action} this user?`)) {
      this.adminService.toggleUserStatus(userId).subscribe({
        next: () => {
          alert(`User ${action}ed successfully`);
          this.fetchUsers();
        },
        error: (err) => console.error('Error updating user', err)
      });
    }
  }

  deleteUser(userId: number): void {
    if (confirm('Are you sure you want to delete this user permanently? This cannot be undone.')) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          alert('User deleted successfully');
          this.fetchUsers();
        },
        error: (err: any) => console.error('Error deleting user', err)
      });
    }
  }

  // --- Reports & All Content Logic ---
  fetchReports(): void {
    this.adminService.getReports().subscribe({
      next: (reports) => this.reports = reports,
      error: (err) => console.error('Error fetching reports', err)
    });
  }

  deleteReport(reportId: number): void {
    this.adminService.deleteReport(reportId).subscribe(() => {
      this.fetchReports();
    });
  }

  contentSearchQuery: string = '';
  onSearchContent(): void {
    if (!this.contentSearchQuery.trim()) return;
    this.adminService.adminSearchVideos(this.contentSearchQuery).subscribe({
      next: (res) => this.allContent = res.content,
      error: (err) => console.error('Error searching content', err)
    });
  }

  deleteVideo(videoId: number): void {
    if (confirm('Are you sure you want to delete this content?')) {
      this.adminService.deleteVideo(videoId).subscribe({
        next: () => {
          alert('Content deleted successfully');
          if (this.activeTab === 'reports') this.fetchReports();
          if (this.activeTab === 'all-content') this.onSearchContent();
          if (this.activeTab === 'videos') this.fetchPendingVideos();
        },
        error: (err) => alert('Failed to delete content')
      });
    }
  }

  logout(): void {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('isAdminLoggedIn'); // Clear old flag just in case
    this.router.navigate(['/admin']);
  }
}