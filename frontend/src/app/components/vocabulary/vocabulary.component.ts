import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { LearningService } from '../../services/learning.service';
import { VocabularyWord } from '../../core/models';

interface CategoryOption { key: string; label: string; icon: string; }

@Component({
  selector: 'app-vocabulary',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2 class="page-title">Vocabulary Builder</h2>
          <p class="page-sub">Expand your linguistic repertoire</p>
        </div>

        <!-- Form control #7: search input -->
        <div class="search-wrap">
          <svg class="search-icon" width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>
          <input
            type="text"
            [(ngModel)]="searchQuery"
            name="search"
            placeholder="Search words..."
            (keyup.enter)="onSearch()"
            (input)="onSearchInput()"
          />
          <!-- Click event #5: Search → API request -->
          <button class="search-btn" (click)="onSearch()">Search</button>
        </div>
      </div>

      <!-- Category filters — Click event #6: category select → API -->
      <div class="categories">
        @for (cat of categories; track cat.key) {
          <button
            class="cat-btn"
            [class.active]="activeCategory === cat.key"
            (click)="selectCategory(cat.key)"
          >
            <span>{{ cat.icon }}</span>
            {{ cat.label }}
          </button>
        }
      </div>

      @if (svc.apiError()) {
        <div class="error-banner">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {{ svc.apiError() }}
        </div>
      }

      <!-- Loading skeletons -->
      @if (svc.isLoading()) {
        <div class="grid">
          @for (i of [1,2,3,4]; track i) {
            <div class="skeleton-card"></div>
          }
        </div>
      }

      <!-- Vocabulary grid — @for loop -->
      @if (!svc.isLoading()) {
        <div class="words-count">
          <span>{{ svc.vocabulary().length }} words</span>
          @if (favCount > 0) {
            <span class="fav-count">
              <svg width="12" height="12" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/></svg>
              {{ favCount }} favorited
            </span>
          }
        </div>

        <div class="grid">
          @for (word of svc.vocabulary(); track word.id) {
            <div class="word-card fade-in-up" [style.animation-delay]="($index * 0.06) + 's'">
              <div class="card-header">
                <div class="word-title-row">
                  <h3 class="word-name">{{ word.word }}</h3>
                  <!-- Click event #7: play audio (future feature) -->
                  <button class="audio-btn" title="Pronunciation" (click)="playAudio(word)">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.536 8.464a5 5 0 010 7.072M12 6v12M9.536 8.464a5 5 0 000 7.072"/></svg>
                  </button>
                </div>
                <!-- Click event #6: Favorite toggle → API request -->
                <button
                  class="fav-btn"
                  [class.active]="word.isFavorited"
                  (click)="toggleFavorite(word)"
                  title="Add to favorites"
                >
                  <svg width="18" height="18" [attr.fill]="word.isFavorited ? 'currentColor' : 'none'" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/></svg>
                </button>
              </div>

              <span class="pos-badge">{{ word.partOfSpeech }}</span>

              <div class="definition-block">
                <p class="def-label">Definition</p>
                <p class="definition">{{ word.definition }}</p>
              </div>

              <div class="example-block">
                <p class="example-label">Example</p>
                <p class="example-text">{{ word.example }}</p>
              </div>

              @if (word.synonyms.length > 0) {
                <div class="synonyms">
                  <p class="syn-label">Synonyms</p>
                  <div class="syn-tags">
                    @for (syn of word.synonyms; track syn) {
                      <span class="syn-tag">{{ syn }}</span>
                    }
                  </div>
                </div>
              }
            </div>
          }
        </div>

        @if (svc.vocabulary().length === 0) {
          <div class="empty-state">
            <p class="empty-icon">📚</p>
            <p>No words found. Try a different search or category.</p>
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 48px 60px 80px;
      min-height: calc(100vh - 140px);
    }
    .page-header {
      display: flex; align-items: flex-start; justify-content: space-between;
      margin-bottom: 28px; gap: 24px; flex-wrap: wrap;
    }
    .page-title { font-size: 2.2rem; font-weight: 800; }
    .page-sub { color: var(--text-secondary); font-size: 0.95rem; margin-top: 6px; }

    .search-wrap {
      display: flex; align-items: center; gap: 8px;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      padding: 6px 8px 6px 16px;
      min-width: 280px;
      transition: border-color 0.2s;
      &:focus-within { border-color: var(--accent-violet); }
    }
    .search-icon { color: var(--text-muted); flex-shrink: 0; }
    .search-wrap input {
      background: none; border: none;
      color: var(--text-primary); font-size: 0.9rem; flex: 1;
      &::placeholder { color: var(--text-muted); }
    }
    .search-btn {
      background: var(--grad-btn); color: #fff;
      font-size: 0.82rem; font-weight: 600;
      padding: 7px 16px; border-radius: var(--radius-pill);
      transition: opacity 0.2s; white-space: nowrap;
      &:hover { opacity: 0.85; }
    }

    .categories {
      display: flex; gap: 10px; margin-bottom: 28px; flex-wrap: wrap;
    }
    .cat-btn {
      display: flex; align-items: center; gap: 8px;
      padding: 9px 20px; border-radius: var(--radius-pill);
      background: var(--bg-card); border: 1px solid var(--border);
      color: var(--text-secondary); font-size: 0.875rem; font-weight: 500;
      transition: all 0.2s;
      &:hover { border-color: var(--accent-violet); color: var(--text-primary); }
      &.active {
        background: rgba(124,58,237,0.2);
        border-color: var(--accent-violet);
        color: var(--accent-violet);
        font-weight: 600;
      }
    }

    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25);
      border-radius: var(--radius); color: #f87171;
      padding: 12px 16px; margin-bottom: 20px; font-size: 0.875rem;
    }

    .words-count {
      display: flex; align-items: center; gap: 12px;
      margin-bottom: 18px;
      span { color: var(--text-muted); font-size: 0.85rem; }
      .fav-count { display: flex; align-items: center; gap: 4px; color: #fbbf24; }
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
      gap: 20px;
    }
    .skeleton-card {
      height: 280px;
      background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%);
      background-size: 400px 100%;
      animation: shimmer 1.4s infinite;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
    }

    .word-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 22px;
      display: flex; flex-direction: column; gap: 12px;
      transition: all 0.25s;
      &:hover { border-color: var(--border-hover); transform: translateY(-2px); box-shadow: var(--shadow-glow); }
    }
    .card-header { display: flex; align-items: flex-start; justify-content: space-between; }
    .word-title-row { display: flex; align-items: center; gap: 8px; }
    .word-name { font-size: 1.2rem; font-weight: 700; }
    .audio-btn {
      background: rgba(255,255,255,0.05); border: 1px solid var(--border);
      border-radius: 50%; width: 28px; height: 28px;
      display: flex; align-items: center; justify-content: center;
      color: var(--text-muted); transition: all 0.2s;
      &:hover { color: var(--accent-violet); border-color: var(--accent-violet); }
    }
    .fav-btn {
      background: none; color: var(--text-muted); padding: 4px;
      transition: all 0.2s;
      &:hover { color: #fbbf24; transform: scale(1.15); }
      &.active { color: #fbbf24; }
    }
    .pos-badge {
      display: inline-block;
      background: rgba(124,58,237,0.15); color: var(--accent-violet);
      font-size: 0.72rem; font-weight: 600; padding: 3px 10px;
      border-radius: var(--radius-pill); text-transform: uppercase; letter-spacing: 0.05em;
    }

    .def-label, .example-label, .syn-label {
      font-size: 0.75rem; font-weight: 700;
      color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.07em;
      margin-bottom: 4px;
    }
    .definition { color: var(--text-primary); font-size: 0.875rem; line-height: 1.5; }
    .example-block {
      background: var(--bg-input); border-radius: var(--radius);
      padding: 10px 14px;
    }
    .example-text { color: var(--text-secondary); font-size: 0.875rem; font-style: italic; }

    .syn-tags { display: flex; flex-wrap: wrap; gap: 6px; }
    .syn-tag {
      background: rgba(255,255,255,0.06); border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      color: var(--text-secondary); font-size: 0.78rem;
      padding: 3px 10px;
    }

    .empty-state {
      text-align: center; padding: 80px; color: var(--text-muted);
      .empty-icon { font-size: 3rem; margin-bottom: 12px; }
    }
  `],
})
export class VocabularyComponent implements OnInit {
  categories: CategoryOption[] = [
    { key: 'business',  label: 'Business English',    icon: '💼' },
    { key: 'academic',  label: 'Academic Vocabulary', icon: '🎓' },
    { key: 'everyday',  label: 'Everyday English',    icon: '💬' },
  ];
  activeCategory = 'business';
  searchQuery = '';

  get favCount(): number {
    return this.svc.vocabulary().filter(w => w.isFavorited).length;
  }

  constructor(public svc: LearningService) {}

  ngOnInit(): void {
    this.svc.getVocabulary(this.activeCategory).subscribe();
  }

  // Click event #5: category select → API request
  selectCategory(key: string): void {
    this.activeCategory = key;
    this.searchQuery = '';
    this.svc.getVocabulary(key).subscribe();
  }

  // Click event #5b: search → API request
  onSearch(): void {
    if (this.searchQuery.trim()) {
      this.svc.searchVocabulary(this.searchQuery.trim(), this.activeCategory).subscribe();
    } else {
      this.svc.getVocabulary(this.activeCategory).subscribe();
    }
  }

  onSearchInput(): void {
    if (!this.searchQuery.trim()) {
      this.svc.getVocabulary(this.activeCategory).subscribe();
    }
  }

  // Click event #6: toggle favorite → API request
  toggleFavorite(word: VocabularyWord): void {
    this.svc.toggleFavorite(word.id).subscribe();
  }

  // Click event #7: play audio (speech synthesis fallback)
  playAudio(word: VocabularyWord): void {
    if ('speechSynthesis' in window) {
      const utt = new SpeechSynthesisUtterance(word.word);
      utt.lang = 'en-US';
      utt.rate = 0.85;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utt);
    }
  }
}
