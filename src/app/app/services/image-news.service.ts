import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ImageNewsService {
  private apiUrl = 'http://localhost:8080/api/image-news';

  constructor(private http: HttpClient) { }

  getFeed(page: number = 0, size: number = 10, location?: string): Observable<any> {
    let url = `${this.apiUrl}/feed?page=${page}&size=${size}`;
    if (location) {
      url += `&location=${location}`;
    }
    return this.http.get(url);
  }

  getImageNewsById(id: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/${id}`);
  }

  getImageUrl(newsId: number, index: number): string {
    return `${this.apiUrl}/${newsId}/image/${index}`;
  }

  likeImageNews(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/like`, {});
  }

  incrementViewCount(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/view`, {});
  }

  incrementShareCount(id: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/${id}/share`, {});
  }
}
