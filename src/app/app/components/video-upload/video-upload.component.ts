import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VideoService } from '../../services/video.service';

@Component({
  selector: 'app-video-upload',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './video-upload.component.html',
  styleUrls: ['./video-upload.component.css']
})
export class VideoUploadComponent implements OnInit {
  uploadForm: FormGroup;
  showCategories = false;
  showFullDescription = false;
  wordCount = 0;
  videoPreviewUrl: string | null = null;
  thumbnailPreviewUrl: string | null = null;
  videoError: string | null = null;

  // Full category list
  categoryList = [
    { label: 'Politics', value: 'politics' },
    { label: 'Government', value: 'government' },
    { label: 'Global', value: 'global' },
    { label: 'State', value: 'state' },
    { label: 'National', value: 'national' },
    { label: 'Local', value: 'local' },
    { label: 'Election', value: 'election' },
    { label: 'International', value: 'international' },
    { label: 'Foreign Affairs', value: 'foreign-affairs' },
    { label: 'Local Metro', value: 'local-metro' },
    { label: 'Education', value: 'education' },
    { label: 'Religion', value: 'religion' },
    { label: 'Business', value: 'business' },
    { label: 'Economy', value: 'economy' },
    { label: 'Crime & Justice', value: 'crime-justice' },
    { label: 'Science & Tech', value: 'science-tech' },
    { label: 'Health & Wellness', value: 'health-wellness' },
    { label: 'Social Issues', value: 'social' },
    { label: 'Sports', value: 'sports' },
    { label: 'Lifestyle & Beauty', value: 'lifestyle-beauty' },
    { label: 'Entertainment', value: 'entertainment' },
    { label: 'Traffic & Weather', value: 'traffic-weather' },
    { label: 'Environment', value: 'environment' },
    { label: 'Technology', value: 'technology' },
    { label: 'Culture & Heritage', value: 'culture' },
    { label: 'Finance', value: 'finance' }
  ];

  // Location Data for India
  districtsData: { [key: string]: string[] } = {
    'Andhra Pradesh': [
      'Anantapur', 'Chittoor', 'East Godavari', 'Guntur', 'Krishna', 'Kurnool',
      'Prakasam', 'Srikakulam', 'Sri Potti Sreeramulu Nellore', 'Visakhapatnam',
      'Vizianagaram', 'West Godavari', 'YSR Kadapa'
    ],
    'Telangana': [
      'Adilabad', 'Bhadradri Kothagudem', 'Hyderabad', 'Jagtial', 'Jangaon',
      'Jayashankar Bhupalpally', 'Jogulamba Gadwal', 'Kamareddy', 'Karimnagar',
      'Khammam', 'Kumuram Bheem', 'Mahabubabad', 'Mahabubnagar', 'Mancherial',
      'Medak', 'Medchal', 'Nagarkurnool', 'Nalgonda', 'Nirmal', 'Nizamabad',
      'Peddapalli', 'Rajanna Sircilla', 'Rangareddy', 'Sangareddy', 'Siddipet',
      'Suryapet', 'Vikarabad', 'Wanaparthy', 'Warangal (Rural)', 'Warangal (Urban)',
      'Yadadri Bhuvanagiri'
    ]
  };

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService,
    private translate: TranslateService,
    private videoService: VideoService
  ) {
    this.uploadForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(5), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10)]],
      tags: [''],
      categories: ['', Validators.required],
      terms: [false, Validators.requiredTrue],
      // New Location Controls
      country: ['', Validators.required],
      state: [''], // Required if country is India
      district: [''] // Required if state is present
    });
  }

  ngOnInit(): void {
    if (!this.authService.currentUserValue) {
      this.router.navigate(['/login']);
      return;
    }

    this.uploadForm.get('description')?.valueChanges.subscribe(value => {
      this.wordCount = value ? value.length : 0;
    });

    // Dynamic validation updates for location
    this.uploadForm.get('country')?.valueChanges.subscribe(val => this.onCountryChange(val));
    this.uploadForm.get('state')?.valueChanges.subscribe(val => this.onStateChange(val));
  }

  onCountryChange(country: string): void {
    const stateControl = this.uploadForm.get('state');
    const districtControl = this.uploadForm.get('district');

    if (country === 'India') {
      stateControl?.setValidators(Validators.required);
    } else {
      stateControl?.clearValidators();
      stateControl?.setValue('');
    }
    stateControl?.updateValueAndValidity();

    // Always reset district when country changes
    districtControl?.clearValidators();
    districtControl?.setValue('');
    districtControl?.updateValueAndValidity();
  }

  onStateChange(state: string): void {
    const districtControl = this.uploadForm.get('district');
    if (state && (state === 'Andhra Pradesh' || state === 'Telangana')) {
      districtControl?.setValidators(Validators.required);
    } else {
      districtControl?.clearValidators();
      districtControl?.setValue('');
    }
    districtControl?.updateValueAndValidity();
  }

  get formattedAddress(): string | null {
    const country = this.uploadForm.get('country')?.value;
    const state = this.uploadForm.get('state')?.value;
    const district = this.uploadForm.get('district')?.value;

    if (!country) return null;
    if (country === 'Global') return 'Global News';

    const parts = [];
    if (district) parts.push(district);
    if (state) parts.push(state);
    parts.push(country);

    return parts.join(', ');
  }

  get availableDistricts(): string[] {
    const state = this.uploadForm.get('state')?.value;
    return state ? this.districtsData[state] || [] : [];
  }

  get truncatedDescription(): string {
    const desc = this.uploadForm.get('description')?.value || '';
    return this.showFullDescription ? desc : desc.slice(0, 300) + (desc.length > 300 ? '...' : '');
  }

  toggleReadMore(): void {
    this.showFullDescription = !this.showFullDescription;
  }

  toggleCategories(): void {
    this.showCategories = !this.showCategories;
  }

  getSelectedCategoryLabel(): string | undefined {
    const value = this.uploadForm.get('categories')?.value;
    if (!value) return undefined;
    return this.categoryList.find(c => c.value === value)?.label;
  }

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      if (!file.type.startsWith('video/')) {
        this.videoError = 'Please select a valid video file.';
        this.videoPreviewUrl = null;
        return;
      }

      const video = document.createElement('video');
      video.preload = 'metadata';
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 300) {
          this.videoError = 'News Report must be 5 minutes or less.';
          this.videoPreviewUrl = null;
          return;
        }
        this.videoError = null;
        this.videoPreviewUrl = URL.createObjectURL(file);
      };
      video.src = URL.createObjectURL(file);
    }
  }

  onThumbnailSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.thumbnailPreviewUrl = URL.createObjectURL(file);
    }
  }

  // onSubmit checks everything
  onSubmit(): void {
    const errors: string[] = [];

    // 1. Check FormGroup
    if (this.uploadForm.invalid) {
      if (this.uploadForm.get('title')?.invalid) errors.push('• Headline is required (5-100 chars).');
      if (this.uploadForm.get('description')?.invalid) errors.push('• Description is too short (min 10 chars).');
      if (this.uploadForm.get('categories')?.invalid) errors.push('• Please select a Category.');
      if (this.uploadForm.get('country')?.invalid) errors.push('• Please select a Location (Country).');
      if (this.uploadForm.get('state')?.invalid) errors.push('• State is required for India.');
      if (this.uploadForm.get('district')?.invalid) errors.push('• District is required.');
      if (this.uploadForm.get('terms')?.invalid) errors.push('• You must agree to the Reporting Standards.');
    }

    // 2. Check Video File manually
    const fileInput = document.getElementById('videoFile') as HTMLInputElement;
    if (!fileInput || !fileInput.files || !fileInput.files[0]) {
      errors.push('• Video Evidence is missing.');
    }

    if (errors.length > 0) {
      this.uploadForm.markAllAsTouched();
      alert('Please fix the following issues:\n\n' + errors.join('\n'));
      return;
    }

    // Prepare FormData
    const formData = new FormData();
    formData.append('title', this.uploadForm.get('title')?.value);
    formData.append('description', this.uploadForm.get('description')?.value);
    formData.append('videoFile', fileInput.files![0]);

    // Append Location Data
    const formattedLocation = this.formattedAddress;
    if (formattedLocation) {
      formData.append('location', formattedLocation);
    }

    const thumbInput = document.getElementById('thumbnail') as HTMLInputElement;
    if (thumbInput?.files?.[0]) {
      formData.append('thumbnail', thumbInput.files[0]);
    }

    formData.append('tags', this.uploadForm.get('tags')?.value);

    // Send single category value as a JSON list string "[value]" if backend expects a list
    const selectedCategory = this.uploadForm.get('categories')?.value;
    formData.append('categories', JSON.stringify([selectedCategory]));

    this.videoService.uploadVideo(formData).subscribe({
      next: (response) => {
        alert('Report Submitted Successfully! \nStatus: PENDING ADMIN APPROVAL');
        this.router.navigate(['/home']);
      },
      error: (err) => {
        console.error('Upload failed', err);
        if (err.status === 403) {
          alert('Upload Failed: Session Expired or Unauthorized. Please Log Out and Log In again.');
        } else {
          alert('Upload Failed: ' + (err.error?.message || 'Server error'));
        }
      }
    });
  }
}