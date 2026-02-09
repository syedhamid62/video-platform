import { Routes } from '@angular/router';

// ──────────────────────────────────────────────
// Component Imports
// ──────────────────────────────────────────────
import { HomeComponent } from './app/components/home/home.component';
import { LoginComponent } from './app/components/auth/login/login.component';
import { RegisterComponent } from './app/components/auth/register/register.component';
import { OtpVerificationComponent } from './app/components/auth/otp-verification/otp-verification.component';
import { VideoPlayerComponent } from './app/components/video-player/video-player.component';
import { VideoUploadComponent } from './app/components/video-upload/video-upload.component';
import { AboutComponent } from './components/about/about.component';  // Create with ng g c components/about
import { NewsComponent } from './components/news/news.component';
import { AdvertiseComponent } from './components/advertise/advertise.component';
import { AdminLoginComponent } from './app/components/admin/admin-login/admin-login.component';
import { AdminComponent } from './app/components/admin/admin.component';
import { ProfileComponent } from './profile/profile.component';

import { PrivacyPolicyComponent } from './pages/privacy-policy/privacy-policy.component';
import { TermsOfServiceComponent } from './pages/terms-of-service/terms-of-service.component';

// ──────────────────────────────────────────────
// Guard Import
// ──────────────────────────────────────────────
import { adminGuard } from './app/guards/admin.guard';   // adjust path if your guard is elsewhere
import { SearchComponent } from './app/components/search/search.component';

export const routes: Routes = [
  // Default redirect
  { path: '', redirectTo: '/home', pathMatch: 'full' },

  // Public routes
  { path: 'home', component: HomeComponent },
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'verify-otp', component: OtpVerificationComponent },
  { path: 'about', component: AboutComponent },
  { path: 'news', component: NewsComponent },
  { path: 'search', component: SearchComponent },
  { path: 'advertise', component: AdvertiseComponent },

  // Video & upload
  {
    path: 'video/:id',
    loadComponent: () => import('./app/components/video-detail/video-detail.component').then(m => m.VideoDetailComponent)
  },
  { path: 'upload', component: VideoUploadComponent },
  {
    path: 'image-upload',
    loadComponent: () => import('./app/components/image-upload/image-upload.component').then(m => m.ImageUploadComponent)
  },
  {
    path: 'image-news/:id',
    loadComponent: () => import('./app/components/image-news-detail/image-news-detail.component').then(m => m.ImageNewsDetailComponent)
  },

  // Profile
  { path: 'profile', component: ProfileComponent },
  { path: 'profile/:id', component: ProfileComponent },

  // ──────────────────────────────────────────────
  // Admin routes
  // ──────────────────────────────────────────────
  // Login page (shown when clicking "Admin Panel" in footer)
  { path: 'admin', component: AdminLoginComponent },

  // Protected dashboard (only accessible after successful login)


  {
    path: 'admin/dashboard',
    component: AdminComponent,
    canActivate: [adminGuard]
  },

  // Optional: Catch-all wildcard (uncomment if you want)
  // { path: '**', redirectTo: '/home' }

  { path: 'privacy', component: PrivacyPolicyComponent },
  { path: 'terms', component: TermsOfServiceComponent },
];