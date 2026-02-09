import { Component } from '@angular/core';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-language-selector',
  standalone: true,
  imports: [CommonModule, TranslateModule, FormsModule],
  templateUrl: './language-selector.component.html',
  styleUrls: ['./language-selector.component.css']
})
export class LanguageSelectorComponent {
  languages = [
    { code: 'en', name: 'English' },
    { code: 'hi', name: 'Hindi' },
    { code: 'bn', name: 'Bengali' },
    { code: 'te', name: 'Telugu' },
    { code: 'mr', name: 'Marathi' },
    { code: 'ta', name: 'Tamil' },
    { code: 'ur', name: 'Urdu' },
    { code: 'gu', name: 'Gujarati' },
    { code: 'kn', name: 'Kannada' }
  ];

  selectedLanguage = 'en';

  constructor(private translate: TranslateService) {
    this.translate.addLangs(this.languages.map(l => l.code));
    this.translate.setDefaultLang('en');
    const browserLang = this.translate.getBrowserLang();
    // Use browser language if it matches one of ours, otherwise default to 'en'
    this.selectedLanguage = browserLang && this.languages.some(l => l.code === browserLang) ? browserLang : 'en';
    this.translate.use(this.selectedLanguage);
  }

  switchLanguage(lang: string) {
    this.selectedLanguage = lang;
    this.translate.use(lang);
  }
}
