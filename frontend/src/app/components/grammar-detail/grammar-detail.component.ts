import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { LearningService } from '../../services/learning.service';
import { GrammarTopic } from '../../core/models';

@Component({
  selector: 'app-grammar-detail',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <!-- Back button — Click event #5 -->
      <button class="back-btn" (click)="goBack()">
        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
        Grammar Topics
      </button>

      @if (svc.isLoading()) {
        <div class="loading-wrap">
          <div class="spinner-lg"></div>
          <p>Loading topic...</p>
        </div>
      }

      @if (!svc.isLoading() && topic) {
        <div class="topic-header fade-in-up">
          <div class="badges">
            <span class="level-badge" [class]="topic.level">{{ topic.level }}</span>
            <span class="cat-tag">{{ topic.category }}</span>
          </div>
          <h1>{{ topic.title }}</h1>
          <p class="topic-desc">{{ topic.description }}</p>
        </div>

        <!-- Rules section — @for loop -->
        @if (topic.rules && topic.rules.length > 0) {
          <section class="section">
            <h2 class="section-title">
              <span class="section-icon">📋</span> Rules & Structure
            </h2>
            <div class="rules-grid">
              @for (rule of topic.rules; track rule.id) {
                <div class="rule-card fade-in-up" [style.animation-delay]="($index * 0.1) + 's'">
                  <h3>{{ rule.title }}</h3>
                  <p class="rule-explanation">{{ rule.explanation }}</p>
                  @if (rule.formula) {
                    <div class="formula">
                      <span class="formula-label">Formula:</span>
                      <code>{{ rule.formula }}</code>
                    </div>
                  }
                  <div class="examples">
                    <p class="ex-label">Examples:</p>
                    @for (ex of rule.examples; track ex) {
                      <p class="example-item">
                        <svg width="12" height="12" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
                        {{ ex }}
                      </p>
                    }
                  </div>
                </div>
              }
            </div>
          </section>
        }

        <!-- Examples section -->
        @if (topic.examples && topic.examples.length > 0) {
          <section class="section">
            <h2 class="section-title">
              <span class="section-icon">💡</span> Additional Examples
            </h2>
            <div class="examples-list">
              @for (ex of topic.examples; track ex) {
                <div class="ex-item">
                  <span class="ex-num">{{ $index + 1 }}</span>
                  <p>{{ ex }}</p>
                </div>
              }
            </div>
          </section>
        }

        <!-- Practice CTA — Click event #6: navigates to flashcards (triggers API load) -->
        <div class="practice-cta fade-in-up">
          <div class="cta-text">
            <h3>Ready to practice?</h3>
            <p>Test your knowledge with interactive flashcards</p>
          </div>
          <button class="btn-practice" (click)="goToFlashcards()">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            Practice Flashcards
          </button>
        </div>
      }

      @if (!svc.isLoading() && !topic) {
        <div class="not-found">
          <p>Topic not found.</p>
          <button class="back-btn" (click)="goBack()">← Back to Grammar</button>
        </div>
      }
    </div>
  `,
  styles: [`
    .page {
      max-width: 900px;
      margin: 0 auto;
      padding: 40px 60px 80px;
    }
    .back-btn {
      display: inline-flex; align-items: center; gap: 6px;
      background: none; color: var(--text-secondary);
      font-size: 0.875rem; font-weight: 500; padding: 0;
      margin-bottom: 32px;
      transition: color 0.2s;
      &:hover { color: var(--text-primary); }
    }
    .loading-wrap {
      display: flex; flex-direction: column; align-items: center; gap: 16px;
      padding: 100px 0;
      .spinner-lg {
        width: 40px; height: 40px;
        border: 3px solid var(--border);
        border-top-color: var(--accent-violet);
        border-radius: 50%;
        animation: spin 0.8s linear infinite;
      }
      p { color: var(--text-secondary); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .topic-header {
      margin-bottom: 48px;
      .badges { display: flex; gap: 8px; margin-bottom: 14px; }
      h1 { font-size: 2.4rem; font-weight: 800; }
      .topic-desc { color: var(--text-secondary); font-size: 1rem; margin-top: 10px; }
    }
    .level-badge {
      font-size: 0.72rem; font-weight: 600; padding: 3px 12px;
      border-radius: var(--radius-pill); text-transform: uppercase; letter-spacing: 0.05em;
      &.beginner { background: rgba(16,185,129,0.15); color: var(--accent-green); }
      &.intermediate { background: rgba(168,85,247,0.15); color: var(--accent-violet); }
      &.advanced { background: rgba(248,113,113,0.15); color: #f87171; }
    }
    .cat-tag { font-size: 0.8rem; color: var(--text-muted); padding: 3px 0; }

    .section { margin-bottom: 44px; }
    .section-title {
      font-size: 1.25rem; font-weight: 700; margin-bottom: 20px;
      display: flex; align-items: center; gap: 10px;
      .section-icon { font-size: 1.1rem; }
    }

    .rules-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(340px, 1fr)); gap: 16px;
    }
    .rule-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 22px;
      h3 { font-size: 1rem; font-weight: 700; margin-bottom: 8px; }
      .rule-explanation { color: var(--text-secondary); font-size: 0.875rem; line-height: 1.55; }
    }
    .formula {
      background: rgba(124,58,237,0.1);
      border: 1px solid rgba(124,58,237,0.2);
      border-radius: var(--radius);
      padding: 10px 14px; margin-top: 12px;
      display: flex; align-items: center; gap: 8px;
      .formula-label { color: var(--accent-violet); font-size: 0.78rem; font-weight: 600; }
      code { font-family: var(--font-mono); color: var(--text-primary); font-size: 0.85rem; }
    }
    .examples { margin-top: 14px; }
    .ex-label { font-size: 0.78rem; font-weight: 600; color: var(--text-muted); margin-bottom: 6px; text-transform: uppercase; letter-spacing: 0.05em; }
    .example-item {
      display: flex; align-items: flex-start; gap: 6px;
      color: var(--text-secondary); font-size: 0.875rem;
      margin-top: 4px;
      svg { color: var(--accent-violet); flex-shrink: 0; margin-top: 4px; }
    }

    .examples-list { display: flex; flex-direction: column; gap: 10px; }
    .ex-item {
      display: flex; align-items: flex-start; gap: 14px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 14px 18px;
      .ex-num {
        min-width: 26px; height: 26px;
        background: rgba(124,58,237,0.2);
        color: var(--accent-violet); border-radius: 50%;
        display: flex; align-items: center; justify-content: center;
        font-size: 0.78rem; font-weight: 700;
      }
      p { color: var(--text-primary); font-size: 0.9rem; line-height: 1.5; }
    }

    .practice-cta {
      display: flex; align-items: center; justify-content: space-between;
      background: linear-gradient(135deg, rgba(124,58,237,0.2), rgba(129,140,248,0.1));
      border: 1px solid rgba(124,58,237,0.3);
      border-radius: var(--radius-lg); padding: 28px 32px;
      margin-top: 16px;
      .cta-text h3 { font-size: 1.1rem; font-weight: 700; }
      .cta-text p { color: var(--text-secondary); font-size: 0.875rem; margin-top: 4px; }
    }
    .btn-practice {
      display: flex; align-items: center; gap: 8px;
      background: var(--grad-btn); color: #fff;
      padding: 11px 22px; border-radius: var(--radius);
      font-weight: 600; font-size: 0.9rem;
      transition: opacity 0.2s, transform 0.15s;
      white-space: nowrap;
      &:hover { opacity: 0.9; transform: translateY(-1px); }
    }
    .not-found { text-align: center; padding: 80px; color: var(--text-muted); }
  `],
})
export class GrammarDetailComponent implements OnInit {
  topic: GrammarTopic | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    public svc: LearningService,
  ) {}

  ngOnInit(): void {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.svc.getGrammarTopic(id).subscribe(topic => {
      this.topic = topic;
    });
  }

  goBack(): void {
    this.router.navigate(['/grammar']);
  }

  // Click event #6: Go to flashcards → triggers flashcards API load
  goToFlashcards(): void {
    this.svc.getFlashcards().subscribe();
    this.router.navigate(['/flashcards']);
  }
}
