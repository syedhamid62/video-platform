import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../app/app/services/auth.service'; // adjust path

@Component({
  selector: 'app-advertise',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './advertise.component.html',
  styleUrls: ['./advertise.component.css']
})
export class AdvertiseComponent implements OnInit {
  isLoggedIn = false;
  loading = false;                     // ← Added missing property
  previewUrl: string | null = null;
  uploadError: string | null = null;
  selectedFile: File | null = null;

  adForm = {
    name: '',
    email: '',
    contactNumber: '',
    adType: '',
    description: '',
    scope: 'global',
    state: '',
    district: ''
  };

  private districts: { [key: string]: string[] } = {
    'Andhra Pradesh': [
      'Alluri Sitarama Raju', 'Anakapalli', 'Anantapur', 'Annamayya', 'Bapatla', 'Chittoor',
      'Dr. B. R. Ambedkar Konaseema', 'East Godavari', 'Eluru', 'Guntur', 'Kakinada', 'Krishna',
      'Kurnool', 'Nandyal', 'NTR', 'Palnadu', 'Parvathipuram Manyam', 'Prakasam',
      'Sri Potti Sriramulu Nellore', 'Sri Sathya Sai', 'Srikakulam', 'Tirupati', 'Visakhapatnam',
      'Vizianagaram', 'West Godavari', 'YSR Kadapa'
    ],
    'Telangana': [
      'Adilabad', 'Bhadradri Kothagudem', 'Hanumakonda', 'Hyderabad', 'Jagtial', 'Jangaon',
      'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar', 'Khammam',
      'Kumuram Bheem Asifabad', 'Mahabubabad', 'Mahabubnagar', 'Mancherial', 'Medak',
      'Medchal–Malkajgiri', 'Mulugu', 'Nagarkurnool', 'Nalgonda', 'Narayanpet', 'Nirmal',
      'Nizamabad', 'Peddapalli', 'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet',
      'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal', 'Yadadri Bhuvanagiri'
    ]
  };

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.authService.isLoggedIn$.subscribe(loggedIn => {
      this.isLoggedIn = loggedIn;
    });
  }

  // Single submitForm() - no duplicates
  submitForm(): void {
    if (this.adForm.adType === 'video-ad' && !this.adForm.description.includes('30 seconds')) {
      alert('Video ads must be 30 seconds or less');
      return;
    }

    if (!this.selectedFile && this.adForm.adType !== 'sponsored-post') {
      alert('Please upload a file for your ad');
      return;
    }

    this.loading = true;

    console.log('Advertise form submitted:', this.adForm, 'File:', this.selectedFile);
    this.saveAdToLocalStorage();
    
    setTimeout(() => {  // Simulate async submit
      this.loading = false;
      alert('Your advertising request has been submitted! We will contact you soon.');
    }, 1500);
  }

  getAdTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      'video-ad': 'Video Ad',
      'banner': 'Banner Ad',
      'sponsored-post': 'Sponsored Post'
    };
    return labels[type] || 'Select type';
  }

  getDistricts(): string[] {
    return this.adForm.state ? this.districts[this.adForm.state] || [] : [];
  }

  saveAdToLocalStorage() {
    const ads = JSON.parse(localStorage.getItem('ads') || '[]');
    ads.push(this.adForm);
    localStorage.setItem('ads', JSON.stringify(ads));
  }

  resetUpload() {
    this.previewUrl = null;
    this.selectedFile = null;
    this.uploadError = null;
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.selectedFile = file;

      // Basic validation per type
      if (this.adForm.adType === 'video-ad') {
        if (!file.type.startsWith('video/')) {
          this.uploadError = 'Please select a video file (MP4/WebM)';
          this.previewUrl = null;
          return;
        }
      } else if (this.adForm.adType === 'banner') {
        if (!file.type.startsWith('image/')) {
          this.uploadError = 'Please select an image file (JPG/PNG/GIF)';
          this.previewUrl = null;
          return;
        }
      }

      this.uploadError = null;

      const reader = new FileReader();
      reader.onload = () => {
        this.previewUrl = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  }
}