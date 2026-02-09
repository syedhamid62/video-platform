import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../services/auth.service'; // Correct path 3 levels up

@Component({
  selector: 'app-admin-login',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './admin-login.component.html',
  styleUrls: ['./admin-login.component.css']
})
export class AdminLoginComponent {

  username: string = '';
  password: string = '';
  errorMessage: string = '';
  isLoading = false;

  constructor(private router: Router, private authService: AuthService, private http: HttpClient) { }

  ngOnInit(): void {
    if (localStorage.getItem('adminToken')) {
      this.router.navigate(['/admin/dashboard']);
    }
  }

  login(): void {
    this.isLoading = true;
    this.authService.loginAdmin({ email: this.username, password: this.password }).subscribe({
      next: (user) => {
        // success
        this.router.navigate(['/admin/dashboard']);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Login error', err);
        this.errorMessage = err.message || 'Invalid email or password';
        this.isLoading = false;
      }
    });
  }

  createDefaultAdmin(): void {
    if (!confirm('Create default admin account (admin@videoshare.com / admin123)?')) return;

    this.isLoading = true;
    const defaultAdmin = {
      email: 'admin@videoshare.com',
      password: 'admin123',
      username: 'SystemAdmin',
      firstName: 'System',
      lastName: 'Admin'
    };

    // Call the endpoint we created in AuthController
    this.http.post('http://localhost:8080/api/auth/register-admin', defaultAdmin).subscribe({
      next: () => {
        alert('Admin account created! You can now login with: admin@videoshare.com / admin123');
        this.username = 'admin@videoshare.com';
        this.password = 'admin123';
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Creation error', err);
        this.errorMessage = 'Failed to create admin. Backend might need a restart.';
        this.isLoading = false;
      }
    });
  }
}