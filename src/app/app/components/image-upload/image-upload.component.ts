import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { VideoService } from '../../services/video.service';

@Component({
    selector: 'app-image-upload',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './image-upload.component.html',
    styleUrls: ['./image-upload.component.css']
})
export class ImageUploadComponent implements OnInit {
    uploadForm: FormGroup;
    showCategories = false;
    showFullDescription = false;
    wordCount = 0;
    imagePreviewUrls: string[] = [];
    selectedFiles: File[] = [];

    // Full category list (Shared)
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
            // Location Controls
            country: ['', Validators.required],
            state: [''],
            district: ['']
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

    onImagesSelected(event: Event): void {
        const input = event.target as HTMLInputElement;
        if (input.files) {
            this.selectedFiles = Array.from(input.files).slice(0, 5);
            this.imagePreviewUrls = [];

            if (input.files.length > 5) {
                alert('You can only upload up to 5 images.');
            }

            this.selectedFiles.forEach(file => {
                if (file.type.startsWith('image/')) {
                    this.imagePreviewUrls.push(URL.createObjectURL(file));
                }
            });
        }
    }

    onSubmit(): void {
        const errors: string[] = [];

        if (this.uploadForm.invalid) {
            if (this.uploadForm.get('title')?.invalid) errors.push('• Headline is required (5-100 chars).');
            if (this.uploadForm.get('description')?.invalid) errors.push('• Description is too short (min 10 chars).');
            if (this.uploadForm.get('categories')?.invalid) errors.push('• Please select a Category.');
            if (this.uploadForm.get('country')?.invalid) errors.push('• Please select a Location (Country).');
            if (this.uploadForm.get('state')?.invalid) errors.push('• State is required for India.');
            if (this.uploadForm.get('district')?.invalid) errors.push('• District is required.');
            if (this.uploadForm.get('terms')?.invalid) errors.push('• You must agree to the Reporting Standards.');
        }

        if (this.selectedFiles.length === 0) {
            errors.push('• At least one news image is required.');
        }

        if (errors.length > 0) {
            this.uploadForm.markAllAsTouched();
            alert('Please fix the following issues:\n\n' + errors.join('\n'));
            return;
        }

        const formData = new FormData();
        formData.append('title', this.uploadForm.get('title')?.value);
        formData.append('description', this.uploadForm.get('description')?.value);
        formData.append('location', this.formattedAddress || 'Global');
        formData.append('tags', this.uploadForm.get('tags')?.value);
        formData.append('categories', JSON.stringify([this.uploadForm.get('categories')?.value]));

        this.selectedFiles.forEach(file => {
            formData.append('imageFiles', file);
        });

        this.videoService.uploadImageNews(formData).subscribe({
            next: (response) => {
                alert('Image News Submitted Successfully! \nStatus: PENDING ADMIN APPROVAL');
                this.router.navigate(['/home']);
            },
            error: (err) => {
                console.error('Upload failed', err);
                alert('Upload Failed: ' + (err.error?.message || 'Server error'));
            }
        });
    }
}
