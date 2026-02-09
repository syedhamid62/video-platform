import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { VideoService } from '../../services/video.service';
import { ImageNewsService } from '../../services/image-news.service';

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
    videos: any[] = [];
    trending: any[] = [];
    recommendations: any[] = [];
    videoLimit: number = 7;

    // Filters
    selectedScope: 'india' | 'global' = 'global';
    selectedState: string | null = null;
    selectedDistrict: string | null = null;
    selectedCategory: string = 'all';

    // Categories Configuration
    allCategories = [
        { id: 'all', label: 'All' },
        { id: 'news', label: 'News' },
        { id: 'flash', label: 'Flash News' },
        { id: 'entertainment', label: 'Entertainment News' },
        { id: 'politics', label: 'Politics' },
        { id: 'viral', label: 'Viral' },
        { id: 'sports', label: 'Sports' },
        { id: 'crime', label: 'Crime' },
        { id: 'daily', label: 'Daily' },
        // New Categories
        { id: 'government', label: 'Government' },
        { id: 'global', label: 'Global' },
        { id: 'state', label: 'State' },
        { id: 'national', label: 'National' },
        { id: 'local', label: 'Local' },
        { id: 'election', label: 'Election' },
        { id: 'international', label: 'International' },
        { id: 'foreign-affairs', label: 'Foreign Affairs' },
        { id: 'local-metro', label: 'Local Metro' },
        { id: 'education', label: 'Education' },
        { id: 'religion', label: 'Religion' },
        { id: 'business', label: 'Business' },
        { id: 'economy', label: 'Economy' },
        { id: 'crime-justice', label: 'Crime & Justice' },
        { id: 'science-tech', label: 'Science & Tech' },
        { id: 'health-wellness', label: 'Health & Wellness' },
        { id: 'social-issues', label: 'Social Issues' },
        { id: 'lifestyle-beauty', label: 'Lifestyle & Beauty' },
        { id: 'traffic-weather', label: 'Traffic & Weather' },
        { id: 'environment', label: 'Environment' },
        { id: 'technology', label: 'Technology' },
        { id: 'culture-heritage', label: 'Culture & Heritage' },
        { id: 'finance', label: 'Finance' }
    ];

    visibleCategoryCount = 10;

    get visibleCategories() {
        return this.allCategories.slice(0, this.visibleCategoryCount);
    }

    get moreCategories() {
        return this.allCategories.slice(this.visibleCategoryCount);
    }

    // Districts (full list)
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

    // Ads (fetched from localStorage)
    ads: any[] = [];

    // Image News & Sidebar News
    imageNews: any[] = [];
    imageNewsPairs: any[][] = [];
    sidebarNews: any[] = [];

    constructor(
        private videoService: VideoService,
        private imageNewsService: ImageNewsService
    ) { }

    ngOnInit(): void {
        this.loadAds();
        this.loadVideos();
        this.loadImageNews(); // Fetch real image news
        this.shuffleAds();
        console.log('Sidebar Ad Images:', this.sidebarAdImages);
    }

    shuffleAds() {
        for (let i = this.sidebarAdImages.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.sidebarAdImages[i], this.sidebarAdImages[j]] = [this.sidebarAdImages[j], this.sidebarAdImages[i]];
        }
    }

    videoSections: { title: string; videos: any[] }[] = [];

    loadVideos() {
        let locationParam = '';
        if (this.selectedDistrict) {
            locationParam = this.selectedDistrict;
        } else if (this.selectedState) {
            locationParam = this.selectedState;
        } else if (this.selectedScope === 'india') {
            locationParam = 'India';
        }

        this.videoService.getAllVideos(this.selectedCategory, locationParam).subscribe({
            next: (data: any) => {
                this.videos = data.content ? data.content : data;
                this.organizeSections();
                this.populateNewsData();
            },
            error: (err) => console.error('Failed to load videos', err)
        });
    }

    loadImageNews() {
        // Fetch real image news from backend
        // We can pass current location logic if needed, or just fetch global feed
        let locationParam = '';
        if (this.selectedDistrict) locationParam = this.selectedDistrict;
        else if (this.selectedState) locationParam = this.selectedState;

        // Increased fetch size to cover both Visual Stories (5) and Sidebar (13-20)
        this.imageNewsService.getFeed(0, 25, locationParam).subscribe({
            next: (data: any) => {
                const content = data.content ? data.content : data;

                // Map all fetched news to simplified object structure
                const allImageNews = content.map((news: any) => ({
                    id: news.id,
                    title: news.title,
                    description: news.description,
                    image: this.imageNewsService.getImageUrl(news.id, 0), // Get first image
                    source: news.user?.username || 'AM5TV News',
                    date: new Date(news.createdAt).toLocaleDateString()
                }));

                // 1. Visual Stories (First 5 items)
                this.imageNews = allImageNews.slice(0, 5);
                this.imageNewsPairs = this.chunkArray(this.imageNews, 2);

                // 2. Sidebar Flash News (Remaining items)
                // If we have less than 5 items, sidebar will take nothing initially
                let sidebarSource = allImageNews.length > 5 ? allImageNews.slice(5) : allImageNews;

                // Fallback: If total items are few, just reuse the same items for sidebar
                if (sidebarSource.length === 0 && allImageNews.length > 0) {
                    sidebarSource = [...allImageNews];
                }

                this.sidebarNews = sidebarSource;

                // Ensure sidebar has enough items (loop/duplicate) to fill UI logic (needs ~13-20)
                while (this.sidebarNews.length < 20 && this.sidebarNews.length > 0) {
                    this.sidebarNews = [...this.sidebarNews, ...this.sidebarNews];
                }
            },
            error: (err) => console.error('Failed to load image news', err)
        });
    }

    organizeSections() {
        if (this.selectedCategory !== 'all' || (this.selectedScope === 'india' && this.selectedState)) {
            this.videoSections = [{
                title: `LATEST IN ${this.selectedCategory !== 'all' ? this.selectedCategory.toUpperCase() : 'NEWS'}`,
                videos: this.videos
            }];
            return;
        }

        const sectionTitles = [
            'NEWS TODAY', 'INDIA FIRST', 'BUSINESS TODAY',
            'TECH & GADGETS', 'ENTERTAINMENT', 'SPORTS 360'
        ];

        this.videoSections = sectionTitles.map((title, index) => {
            if (this.videos.length === 0) return { title, videos: [] };
            const start = (index * 3) % this.videos.length;
            let sectionVideos = this.videos.slice(start, start + 3);
            return {
                title: title,
                videos: sectionVideos
            };
        });
    }

    populateNewsData() {
        // 1. Image News is handled by loadImageNews()
        // 2. Sidebar News is handled by loadImageNews() (now using Image News instead of videos)
        // Kept empty to avoid breaking calls, but logic moved.
    }

    setScope(scope: 'india' | 'global') {
        this.selectedScope = scope;
        this.selectedState = null;
        this.selectedDistrict = null;
        this.loadAds();
        this.loadVideos();
        this.loadImageNews(); // Reload image news too
    }

    setState(state: string) {
        this.selectedState = state;
        this.selectedDistrict = null;
        this.loadAds();
        this.loadVideos();
        this.loadImageNews();
    }

    setDistrict(district: string) {
        this.selectedDistrict = district;
        this.loadAds();
        this.loadVideos();
        this.loadImageNews();
    }

    setCategory(category: string) {
        this.selectedCategory = category;
        this.loadAds();
        this.loadVideos();
        // Image news might not support category filtering yet in backend API, but if it did, we'd pass it
    }

    getDistricts(): string[] {
        return this.selectedState ? this.districts[this.selectedState] || [] : [];
    }

    chunkArray<T>(array: T[], size: number): T[][] {
        const result: T[][] = [];
        for (let i = 0; i < array.length; i += size) {
            result.push(array.slice(i, i + size));
        }
        return result;
    }

    loadAds() {
        const allAds = JSON.parse(localStorage.getItem('ads') || '[]');
        this.ads = allAds.filter((ad: any) => {
            if (this.selectedScope !== ad.scope) return false;
            if (this.selectedScope === 'india' && this.selectedState && this.selectedState !== ad.state) return false;
            if (this.selectedDistrict && this.selectedDistrict !== ad.district) return false;
            return true;
        });

        if (this.ads.length < 2) {
            this.ads = [
                { thumbnail: 'https://placehold.co/640x360?text=Ad+1' },
                { thumbnail: 'https://placehold.co/640x360?text=Ad+2' }
            ];
        }
    }

    sidebarAdImages = [
        '/assets/images/content_images/img_1.jpg',
        '/assets/images/content_images/img_2.jpg',
        '/assets/images/content_images/img_3.jpg',
        '/assets/images/content_images/img_4.jpg',
        '/assets/images/content_images/img_5.jpg',
        '/assets/images/content_images/img_6.jpg',
        '/assets/images/content_images/img_7.jpg',
        '/assets/images/content_images/img_3.jpg'
    ];

    getVideoStreamUrl(videoId: number): string {
        return `http://localhost:8080/api/videos/${videoId}/stream`;
    }

    getThumbnailUrl(video: any): string {
        if (video.thumbnailUrl && video.thumbnailUrl.includes('placehold.co')) {
            return video.thumbnailUrl;
        }
        return `http://localhost:8080/api/videos/${video.id}/thumbnail`;
    }
}
