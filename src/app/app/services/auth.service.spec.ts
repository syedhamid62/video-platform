import { TestBed } from '@angular/core/testing';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideHttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { AuthService, User } from './auth.service';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerSpy: jasmine.SpyObj<Router>;

  const mockUser: User = {
    id: '123',
    username: 'testuser',
    email: 'test@example.com',
    token: 'mock-jwt-token',
    firstName: 'Test',
    lastName: 'User'
  };

  const mockAuthResponse = {
    accessToken: 'mock-jwt-token',
    refreshToken: 'mock-refresh-token',
    user: {
      id: '123',
      username: 'testuser',
      email: 'test@example.com',
      firstName: 'Test',
      lastName: 'User',
      role: 'USER',
      profilePictureUrl: ''
    }
  };

  beforeEach(() => {
    routerSpy = jasmine.createSpyObj('Router', ['navigate']);

    TestBed.configureTestingModule({
      providers: [
        AuthService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: Router, useValue: routerSpy }
      ]
    });

    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);

    // Clear localStorage before each test
    localStorage.clear();
  });

  afterEach(() => {
    httpMock.verify();
    localStorage.clear();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  describe('login', () => {
    it('should login successfully, store token/user, and navigate', () => {
      const credentials = { email: 'test@example.com', password: 'password123' };

      service.login(credentials).subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(localStorage.getItem('token')).toBe(mockUser.token);
        expect(localStorage.getItem('user')).toContain('"id":"123"');
        expect(routerSpy.navigate).toHaveBeenCalledWith(['/home']);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);
    });

    it('should handle login failure', () => {
      const credentials = { email: 'wrong@example.com', password: 'wrong' };

      service.login(credentials).subscribe({
        next: () => fail('Expected error'),
        error: (err) => {
          expect(err.message).toContain('Login failed');
          expect(localStorage.getItem('token')).toBeNull();
          expect(routerSpy.navigate).not.toHaveBeenCalled();
        }
      });

      const req = httpMock.expectOne('http://localhost:8080/api/auth/login');
      req.flush('Invalid credentials', { status: 401, statusText: 'Unauthorized' });
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP, store user, and navigate', () => {
      const email = 'test@example.com';
      const otp = '123456';

      service.verifyOtp(email, otp).subscribe(user => {
        expect(user).toEqual(mockUser);
        expect(localStorage.getItem('token')).toBe(mockUser.token);
        expect(service.currentUserValue).toEqual(mockUser);
      });

      const req = httpMock.expectOne('http://localhost:8080/api/auth/verify');
      expect(req.request.method).toBe('POST');
      req.flush(mockAuthResponse);
    });
  });

  describe('register', () => {
    it('should send registration request', () => {
      const registerData = {
        username: 'newuser',
        email: 'new@example.com',
        password: 'pass123',
        firstName: 'New',
        lastName: 'User'
      };

      service.register(registerData).subscribe(response => {
        expect(response).toBeTruthy();
      });

      const req = httpMock.expectOne('http://localhost:8080/api/auth/register');
      expect(req.request.method).toBe('POST');
      expect(req.request.body).toEqual(registerData);
      req.flush({ message: 'OTP sent' });
    });
  });

  describe('logout', () => {
    it('should clear storage and navigate to login', () => {
      localStorage.setItem('token', 'some-token');
      localStorage.setItem('user', JSON.stringify(mockUser));

      service.logout();

      expect(localStorage.getItem('token')).toBeNull();
      expect(localStorage.getItem('user')).toBeNull();
      expect(routerSpy.navigate).toHaveBeenCalledWith(['/login']);
    });
  });

  describe('isLoggedIn', () => {
    // Note: isLoggedIn is now a getter based on BehaviorSubject
    // logic depends on how "service" initializes from localStorage in constructor
    it('should return false initially if storage empty', () => {
      expect(service.isLoggedIn).toBeFalse();
    });
  });
});