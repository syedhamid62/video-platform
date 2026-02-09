import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';  // 'of' for stub data if needed

@Injectable({
  providedIn: 'root'
})
export class VideoService {
  private apiUrl = 'http://localhost:8080/api/videos';  // Updated to match Spring Boot port

  constructor(private http: HttpClient) { }

  // Fetch all videos for news page (latest/old/trending sorted on frontend)
  getAllVideos(category?: string, location?: string): Observable<any[]> {
    let url = `${this.apiUrl}/feed?size=50`; // Increase size to get more candidates for sections
    if (category && category !== 'all') {
      url += `&category=${encodeURIComponent(category)}`;
    }
    if (location) {
      url += `&location=${encodeURIComponent(location)}`;
    }
    return this.http.get<any[]>(url);
  }


  // Fetch search suggestions (auto-complete)
  getSearchSuggestions(query: string): Observable<string[]> {
    return this.http.get<string[]>(`${this.apiUrl}/suggestions?q=${encodeURIComponent(query)}`);
  }

  // Search videos
  searchVideos(query: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/search?q=${encodeURIComponent(query)}`);
  }

  // Get single video details
  getVideoById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Admin: Fetch pending videos/photos for verification
  getPendingVideos(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/pending`);
    // Stub: return of([{id:1, title:'Pending Video', thumbnail:'url', status:'pending'}]);
  }

  // Admin: Approve content
  approveVideo(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/approve`, {});
  }

  // Admin: Reject content
  rejectVideo(id: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${id}/reject`, {});
  }

  // Upload video report
  uploadVideo(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (!token) {
      console.warn('VideoService: No auth token found for upload!');
    }
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.post<any>(`${this.apiUrl}/upload`, formData, { headers });
  }

  getUserVideos(userId: number): Observable<any[]> {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}`, { headers });
  }

  deleteVideo(videoId: number): Observable<void> {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.delete<void>(`${this.apiUrl}/admin/videos/${videoId}`, { headers }); // Fixed path to admin
  }

  // --- Interactions --- //

  addComment(videoId: number, text: string): Observable<void> {
    const token = localStorage.getItem('token'); // Only logged in users
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.post<void>(`${this.apiUrl}/${videoId}/comments`, { text }, { headers });
  }

  getComments(videoId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/${videoId}/comments`);
  }

  likeVideo(videoId: number): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.post<void>(`${this.apiUrl}/${videoId}/like`, {}, { headers });
  }

  reportVideo(videoId: number, reason: string): Observable<void> {
    const token = localStorage.getItem('token');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.post<void>(`${this.apiUrl}/${videoId}/report`, { reason }, { headers });
  }

  incrementShare(videoId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${videoId}/share`, {});
  }

  incrementView(videoId: number): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/${videoId}/view`, {});
  }

  // --- Image News Methods ---

  uploadImageNews(formData: FormData): Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.post<any>(`http://localhost:8080/api/image-news/upload`, formData, { headers });
  }

  getImageNewsFeed(location?: string): Observable<any> {
    let url = `http://localhost:8080/api/image-news/feed?size=50`;
    if (location) {
      url += `&location=${encodeURIComponent(location)}`;
    }
    return this.http.get<any>(url);
  }

  getImageNewsById(id: number): Observable<any> {
    return this.http.get<any>(`http://localhost:8080/api/image-news/${id}`);
  }

  // Admin moderation for Image News
  getPendingImageNews(): Observable<any[]> {
    const token = localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get<any[]>(`http://localhost:8080/api/admin/pending-image-news`, { headers });
  }

  approveImageNews(id: number): Observable<void> {
    const token = localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.put<void>(`http://localhost:8080/api/admin/image-news/${id}/approve`, {}, { headers });
  }

  rejectImageNews(id: number, reason: string): Observable<void> {
    const token = localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.put<void>(`http://localhost:8080/api/admin/image-news/${id}/reject`, { reason }, { headers });
  }
}