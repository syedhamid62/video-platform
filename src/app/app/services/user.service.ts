import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) { }

  getCurrentUser(): Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.get(`${this.apiUrl}/me`, { headers });
  }

  updateProfile(userData: any): Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    return this.http.put(`${this.apiUrl}/update`, userData, { headers });
  }

  uploadProfilePicture(file: File): Observable<any> {
    const token = localStorage.getItem('token') || localStorage.getItem('adminToken');
    const headers = { 'Authorization': `Bearer ${token}` };
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.apiUrl}/profile-picture`, formData, { headers });
  }

  getProfilePictureUrl(url: string | undefined): string {
    if (!url) return 'https://ui-avatars.com/api/?name=User&background=random'; // Better default
    return `${this.apiUrl}/profile-picture-proxy?url=${encodeURIComponent(url)}`;
  }
}
