import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = 'http://localhost:8080/api/admin'; // Base Admin API URL

  constructor(private http: HttpClient) { }

  private getHeaders() {
    const token = localStorage.getItem('adminToken');
    return {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    };
  }

  // Video Management
  getPendingVideos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending-videos`, this.getHeaders());
  }

  approveVideo(videoId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/videos/${videoId}/approve`, {}, this.getHeaders());
  }

  rejectVideo(videoId: number, reason: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/videos/${videoId}/reject`, { reason }, this.getHeaders());
  }

  deleteVideo(videoId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/videos/${videoId}`, this.getHeaders());
  }

  // User Management
  getAllUsers(): Observable<any[]> {
    const token = localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get<any[]>(`${this.apiUrl}/users`, { headers });
  }

  searchUsers(query: string): Observable<any[]> {
    const token = localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get<any[]>(`${this.apiUrl}/users/search?q=${encodeURIComponent(query)}`, { headers });
  }

  toggleUserStatus(userId: number): Observable<any> {
    return this.http.put<void>(`${this.apiUrl}/users/${userId}/toggle-status`, {}, this.getHeaders());
  }

  deleteUser(userId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/users/${userId}`, this.getHeaders());
  }

  // Reporting & Content Search
  getReports(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports`, this.getHeaders());
  }

  deleteReport(reportId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/reports/${reportId}`, this.getHeaders());
  }

  adminSearchVideos(query: string, page: number = 0, size: number = 10): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/videos/search?q=${encodeURIComponent(query)}&page=${page}&size=${size}`, this.getHeaders());
  }

  // Image News Moderation
  getPendingImageNews(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending-image-news`, this.getHeaders());
  }

  approveImageNews(id: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/image-news/${id}/approve`, {}, this.getHeaders());
  }

  rejectImageNews(id: number, reason: string): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/image-news/${id}/reject`, { reason }, this.getHeaders());
  }
}
