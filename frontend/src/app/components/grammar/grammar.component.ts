import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LearningService } from '../../services/learning.service';
import { GrammarTopic } from '../../core/models';

@Component({
  selector: 'app-grammar',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Grammar Topics</h2>
        <p class="page-sub">Master the foundational structures of English</p>
      </div>

      <!-- Error banner -->
      @if (svc.apiError()) {
        <div class="error-banner">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
          {{ svc.apiError() }}
        </div>
      }

      <!-- Loading skeleton -->
      @if (svc.isLoading()) {
        <div class="grid">
          @for (i of [1,2,3,4,5,6]; track i) {
            <div class="skeleton-card"></div>
          }
        </div>
      }

      <!-- Topics grid — @for loop -->
      @if (!svc.isLoading()) {
        <div class="level-filters">
          @for (level of levels; track level) {
            <button
              class="filter-btn"
              [class.active]="activeLevel === level"
              (click)="setLevel(level)"
            >{{ level }}</button>
          }
        </div>

        <div class="grid">
          @for (topic of filteredTopics; track topic.id) {
            <div class="topic-card fade-in-up" [style.animation-delay]="($index * 0.07) + 's'">
              <div class="card-top">
                <span class="level-badge" [class]="topic.level">{{ topic.level }}</span>
                <span class="category-tag">{{ topic.category }}</span>
              </div>
              <h3 class="card-title">{{ topic.title }}</h3>
              <p class="card-desc">{{ topic.description }}</p>
              <!-- Click event #4: Learn More → API request for topic detail -->
              <button class="learn-btn" (click)="openTopic(topic)">
                Learn More
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 8l4 4m0 0l-4 4m4-4H3"/></svg>
              </button>
            </div>
          }

          <!-- @if for empty state -->
          @if (filteredTopics.length === 0) {
            <div class="empty-state">
              <p>No topics found for this level.</p>
            </div>
          }
        </div>
      }
    </div>

    <footer class="footer">
      <p>Continuous learning, consistent growth</p>
      <span>Practice creates mastery</span>
    </footer>
  `,
  styles: [`
    .page {
      max-width: 1200px;
      margin: 0 auto;
      padding: 48px 60px;
      min-height: calc(100vh - 200px);
    }
    .page-header { margin-bottom: 36px; }
    .page-title { font-size: 2.4rem; font-weight: 800; color: var(--text-primary); }
    .page-sub { color: var(--text-secondary); margin-top: 6px; font-size: 0.95rem; }

    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25);
      border-radius: var(--radius); color: #f87171;
      padding: 12px 16px; margin-bottom: 24px; font-size: 0.875rem;
    }

    .level-filters {
      display: flex; gap: 8px; margin-bottom: 28px; flex-wrap: wrap;
    }
    .filter-btn {
      padding: 7px 18px;
      border-radius: var(--radius-pill);
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 0.85rem; font-weight: 500;
      transition: all 0.2s;
      text-transform: capitalize;
      &:hover { border-color: var(--accent-violet); color: var(--accent-violet); }
      &.active {
        background: rgba(124,58,237,0.2);
        border-color: var(--accent-violet);
        color: var(--accent-violet);
      }
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 20px;
    }

    .skeleton-card {
      height: 180px;
      background: linear-gradient(90deg, var(--bg-card) 25%, var(--bg-card-hover) 50%, var(--bg-card) 75%);
      background-size: 400px 100%;
      animation: shimmer 1.4s infinite;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border);
    }

    .topic-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 26px;
      display: flex; flex-direction: column; gap: 10px;
      transition: all 0.25s;
      &:hover {
        border-color: var(--border-hover);
        background: var(--bg-card-hover);
        transform: translateY(-2px);
        box-shadow: var(--shadow-glow);
      }
    }
    .card-top { display: flex; align-items: center; gap: 8px; }
    .level-badge {
      font-size: 0.72rem; font-weight: 600; padding: 3px 10px;
      border-radius: var(--radius-pill); text-transform: uppercase; letter-spacing: 0.05em;
      &.beginner    { background: rgba(16,185,129,0.15); color: var(--accent-green); }
      &.intermediate { background: rgba(168,85,247,0.15); color: var(--accent-violet); }
      &.advanced    { background: rgba(248,113,113,0.15); color: #f87171; }
    }
    .category-tag {
      font-size: 0.72rem; color: var(--text-muted); font-weight: 500;
    }
    .card-title { font-size: 1.15rem; font-weight: 700; color: var(--text-primary); }
    .card-desc { color: var(--text-secondary); font-size: 0.875rem; line-height: 1.55; flex: 1; }
    .learn-btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: none; color: var(--accent-violet);
      font-size: 0.875rem; font-weight: 600;
      padding: 0; margin-top: 6px;
      transition: gap 0.2s;
      &:hover { gap: 10px; }
    }

    .empty-state {
      grid-column: 1/-1; text-align: center;
      padding: 60px; color: var(--text-muted);
    }

    .footer {
      text-align: center;
      padding: 40px;
      border-top: 1px solid var(--border);
      background: var(--bg-secondary);
      p { color: var(--text-secondary); font-size: 0.9rem; }
      span { color: var(--text-muted); font-size: 0.82rem; display: block; margin-top: 4px; }
    }
  `],
})
export class GrammarComponent implements OnInit {
  topics: GrammarTopic[] = [];
  filteredTopics: GrammarTopic[] = [];
  levels = ['all', 'beginner', 'intermediate', 'advanced'];
  activeLevel = 'all';

  constructor(public svc: LearningService, private router: Router) {}

  ngOnInit(): void {
    // Click event #4 (auto-triggered on load): getGrammarTopics → API
    this.svc.getGrammarTopics().subscribe(topics => {
      this.topics = topics;
      this.applyFilter();
    });
  }

  setLevel(level: string): void {
    this.activeLevel = level;
    this.applyFilter();
  }

  applyFilter(): void {
    this.filteredTopics = this.activeLevel === 'all'
      ? this.topics
      : this.topics.filter(t => t.level === this.activeLevel);
  }

  // Click event #4: Learn More → API request (navigates to detail which loads from API)
  openTopic(topic: GrammarTopic): void {
    this.svc.getGrammarTopic(topic.id).subscribe(() => {
      this.router.navigate(['/grammar', topic.id]);
    });
  }
}
