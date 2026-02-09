// src/app/services/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';
import { Router } from '@angular/router';

export interface User {
  id: string;
  username: string;
  email: string;
  token: string;
  firstName?: string; // Added optional fields
  lastName?: string;
  contactNumber?: string;
  role?: string;
  profilePictureUrl?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    username: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    profilePictureUrl: string;
  };
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private isLoggedInSubject = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this.isLoggedInSubject.asObservable();

  private apiUrl = 'http://localhost:8080/api/auth';

  constructor(private http: HttpClient, private router: Router) {
    // Load from localStorage on init
    const storedUser = localStorage.getItem('user') || localStorage.getItem('adminUser');
    const storedToken = localStorage.getItem('token') || localStorage.getItem('adminToken');
    if (storedUser && storedToken) {
      this.currentUserSubject.next(JSON.parse(storedUser));
      this.isLoggedInSubject.next(true);
    }
  }

  // Synchronous getters (this fixes the TS2551 error)
  get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  get isLoggedIn(): boolean {
    return this.isLoggedInSubject.value;
  }

  login(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        // Enforce Strict Separation: Clear Admin Session when logging in as User
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminUser');
        localStorage.removeItem('isAdminLoggedIn');

        // Map backend response to frontend User object
        const user: User = {
          ...response.user,
          token: response.accessToken
        };

        localStorage.setItem('token', response.accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
        return user;
      }),
      tap(() => {
        this.router.navigate(['/home']);
      }),
      catchError(err => throwError(() => new Error('Login failed')))
    );
  }

  // ✅ SEPARATE ADMIN LOGIN
  loginAdmin(credentials: { email: string; password: string }): Observable<User> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, credentials).pipe(
      map(response => {
        const user: User = {
          ...response.user,
          token: response.accessToken
        };

        if (user.role !== 'ADMIN') {
          throw new Error('Not an Admin');
        }

        // Enforce Strict Separation: Clear USER Session when logging in as Admin
        localStorage.removeItem('token');
        localStorage.removeItem('user');

        // Store in SEPARATE keys (though effectively only one set exists at a time now)
        localStorage.setItem('adminToken', response.accessToken);
        localStorage.setItem('adminUser', JSON.stringify(user));

        this.currentUserSubject.next(user);
        this.isLoggedInSubject.next(true);
        return user;
      }),
      catchError(err => throwError(() => err))
    );
  }

  register(userData: { username: string; email: string; password: string; firstName: string; lastName: string; contactNumber: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  verifyOtp(email: string, otp: string): Observable<any> {
    return this.http.post<AuthResponse>(`${this.apiUrl}/verify`, { email, otp }).pipe(
      map(response => {
        if (response.accessToken && response.user) {
          const user: User = {
            ...response.user,
            token: response.accessToken
          };

          localStorage.setItem('token', response.accessToken);
          localStorage.setItem('user', JSON.stringify(user));
          this.currentUserSubject.next(user);
          this.isLoggedInSubject.next(true);
          return user;
        }
        return response;
      }),
      catchError(err => throwError(() => new Error('OTP Verification failed')))
    );
  }

  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    // Also clear Admin session to prevent leakage
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminUser');
    localStorage.removeItem('isAdminLoggedIn');

    this.currentUserSubject.next(null);
    this.isLoggedInSubject.next(false);
    this.router.navigate(['/login']);
  }

  updateCurrentUser(userUpdates: Partial<User>): void {
    const currentUser = this.currentUserSubject.value;
    if (currentUser) {
      const updatedUser = { ...currentUser, ...userUpdates };

      // Update LocalStorage
      if (currentUser.role === 'ADMIN') {
        localStorage.setItem('adminUser', JSON.stringify(updatedUser));
      } else {
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }

      // Notify subscribers
      this.currentUserSubject.next(updatedUser);
    }
  }
}