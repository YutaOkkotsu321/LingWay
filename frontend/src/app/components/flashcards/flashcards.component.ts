import { Component, OnInit, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LearningService } from '../../services/learning.service';
import { Flashcard } from '../../core/models';

@Component({
  selector: 'app-flashcards',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2 class="page-title">Flashcards</h2>
          <p class="page-sub">Interactive knowledge reinforcement</p>
        </div>
      </div>

      <!-- Progress bar -->
      <div class="progress-section">
        <div class="progress-labels">
          <span>Progress: <strong>{{ progress().mastered }} / {{ progress().total }}</strong> mastered</span>
          <span class="pct" [class.done]="progressPct === 100">{{ progressPct }}%</span>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" [style.width]="progressPct + '%'"></div>
        </div>
      </div>

      <!-- Controls -->
      <div class="controls">
        <!-- Click event #8: Shuffle → API request -->
        <button class="ctrl-btn" (click)="shuffle()" [disabled]="svc.isLoading()">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Shuffle
        </button>
        <!-- Click event (non-API): Reset → API request -->
        <button class="ctrl-btn" (click)="reset()" [disabled]="svc.isLoading()">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/></svg>
          Reset
        </button>
        <!-- Clear all cards -->
        <button class="ctrl-btn danger" (click)="clearAll()" [disabled]="svc.isLoading() || svc.flashcards().length === 0">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a2 2 0 012-2h4a2 2 0 012 2v3"/></svg>
          Clear
        </button>

        @if (progress().mastered > 0) {
          <span class="streak-badge">
            🔥 {{ progress().mastered }} mastered!
          </span>
        }
      </div>

      <!-- Card area -->
      @if (svc.flashcards().length > 0) {
        <div class="card-area">
          <div class="card-meta">
            <span class="card-counter">Card {{ currentIndex + 1 }} of {{ svc.flashcards().length }}</span>
            <span class="category-chip">{{ currentCard?.category }}</span>
            @if (currentCard?.isMastered) {
              <span class="mastered-chip">✓ Mastered</span>
            }
          </div>

          <!-- Flashcard — click to flip -->
          <div
            class="flashcard"
            [class.flipped]="isFlipped"
            (click)="flip()"
          >
            <div class="card-inner">
              <div class="card-front">
                <span class="side-label">QUESTION</span>
                <p class="card-text">{{ currentCard?.question }}</p>
                <p class="flip-hint">Click to reveal answer</p>
              </div>
              <div class="card-back">
                <span class="side-label answer-label">ANSWER</span>
                <p class="card-text answer-text">{{ currentCard?.answer }}</p>
                <div class="difficulty-badge" [class]="currentCard?.difficulty">
                  {{ currentCard?.difficulty }}
                </div>
              </div>
            </div>
          </div>

          <!-- Navigation & actions -->
          <div class="actions">
            <button class="nav-btn" (click)="prev()" [disabled]="currentIndex === 0">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
            </button>

            <div class="rating-btns">
              <!-- Click event #9: Need Practice → API request -->
              <button
                class="btn-practice"
                (click)="markNeedsPractice()"
                [disabled]="!isFlipped"
              >Need Practice</button>

              <!-- Click event #10: Mastered → API request -->
              <button
                class="btn-mastered"
                (click)="markMastered()"
                [disabled]="!isFlipped"
              >
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                Mastered
              </button>
            </div>

            <button class="nav-btn" (click)="next()" [disabled]="currentIndex >= svc.flashcards().length - 1">
              <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/></svg>
            </button>
          </div>

          <!-- Completed state -->
          @if (progress().mastered === progress().total && progress().total > 0) {
            <div class="completed-banner fade-in-up">
              <span>🎉</span>
              <div>
                <p class="completed-title">All cards mastered!</p>
                <p class="completed-sub">Excellent work! Reset to practice again.</p>
              </div>
            </div>
          }
        </div>

        <!-- Mini progress list -->
        <div class="dot-row">
          @for (card of svc.flashcards(); track card.id; let i = $index) {
            <button
              class="dot"
              [class.current]="i === currentIndex"
              [class.mastered]="card.isMastered"
              [class.practiced]="!card.isMastered && card.timesReviewed > 0"
              (click)="goTo(i)"
              [title]="card.question"
            ></button>
          }
        </div>
      }

      @if (svc.isLoading()) {
        <div class="loading-wrap">
          <div class="spinner-lg"></div>
          <p>Loading flashcards...</p>
        </div>
      }

      @if (!svc.isLoading() && svc.flashcards().length === 0) {
        <div class="empty-state">
          <svg width="40" height="40" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"/></svg>
          <p class="empty-title">No flashcards yet</p>
          <p class="empty-sub">Head over to Add Cards to create your first flashcard.</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .page {
      max-width: 900px;
      margin: 0 auto;
      padding: 48px 60px 80px;
    }
    .page-header { margin-bottom: 28px; }
    .page-title { font-size: 2.2rem; font-weight: 800; }
    .page-sub { color: var(--text-secondary); font-size: 0.95rem; margin-top: 6px; }

    .progress-section { margin-bottom: 28px; }
    .progress-labels {
      display: flex; justify-content: space-between; align-items: center;
      margin-bottom: 8px;
      span { color: var(--text-secondary); font-size: 0.875rem; }
      strong { color: var(--text-primary); }
    }
    .pct { font-weight: 700; color: var(--accent-green); font-family: var(--font-mono); }
    .pct.done { color: #fbbf24; }
    .progress-bar {
      height: 6px; background: var(--bg-card);
      border-radius: var(--radius-pill); overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: var(--grad-green);
      border-radius: var(--radius-pill);
      transition: width 0.5s ease;
    }

    .controls {
      display: flex; align-items: center; gap: 10px; margin-bottom: 28px;
    }
    .ctrl-btn {
      display: flex; align-items: center; gap: 7px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;
      padding: 8px 18px; transition: all 0.2s;
      &:hover:not(:disabled) { border-color: var(--accent-violet); color: var(--text-primary); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .ctrl-btn.danger {
      &:hover:not(:disabled) {
        border-color: #f87171;
        color: #f87171;
        background: rgba(248,113,113,0.08);
      }
    }
    .empty-state {
      display: flex; flex-direction: column; align-items: center; gap: 10px;
      padding: 80px 20px;
      color: var(--text-secondary);
      svg { opacity: 0.4; }
      .empty-title { font-size: 1.1rem; font-weight: 600; color: var(--text-primary); }
      .empty-sub { font-size: 0.9rem; }
    }
    .streak-badge {
      margin-left: 8px;
      background: rgba(251,191,36,0.15);
      color: #fbbf24; border-radius: var(--radius-pill);
      padding: 5px 14px; font-size: 0.82rem; font-weight: 600;
    }

    .card-area { display: flex; flex-direction: column; align-items: center; gap: 24px; }

    .card-meta {
      display: flex; align-items: center; gap: 10px;
      .card-counter {
        background: var(--bg-card); border: 1px solid var(--border);
        border-radius: var(--radius-pill); padding: 5px 14px;
        font-size: 0.82rem; color: var(--text-secondary);
      }
      .category-chip {
        background: rgba(129,140,248,0.15); color: var(--accent-indigo);
        border-radius: var(--radius-pill); padding: 5px 14px;
        font-size: 0.82rem; font-weight: 600;
      }
      .mastered-chip {
        background: rgba(16,185,129,0.15); color: var(--accent-green);
        border-radius: var(--radius-pill); padding: 5px 12px;
        font-size: 0.8rem; font-weight: 600;
      }
    }

    /* ── Flip Card ── */
    .flashcard {
      width: 100%; max-width: 640px; height: 280px;
      perspective: 1200px; cursor: pointer;
    }
    .card-inner {
      width: 100%; height: 100%;
      position: relative;
      transform-style: preserve-3d;
      transition: transform 0.55s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    }
    .flashcard.flipped .card-inner { transform: rotateY(180deg); }

    .card-front, .card-back {
      position: absolute; inset: 0;
      backface-visibility: hidden;
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      padding: 36px; gap: 14px;
      box-shadow: var(--shadow-card);
    }
    .card-back {
      transform: rotateY(180deg);
      background: linear-gradient(135deg, rgba(16,185,129,0.08), var(--bg-card));
      border-color: rgba(16,185,129,0.2);
    }

    .side-label {
      background: rgba(124,58,237,0.2); color: var(--accent-violet);
      font-size: 0.72rem; font-weight: 700; letter-spacing: 0.1em;
      padding: 4px 12px; border-radius: var(--radius-pill);
    }
    .answer-label { background: rgba(16,185,129,0.2); color: var(--accent-green); }

    .card-text {
      font-size: 1.15rem; font-weight: 600;
      text-align: center; line-height: 1.5;
      color: var(--text-primary); max-width: 520px;
    }
    .answer-text { color: var(--text-primary); }
    .flip-hint { color: var(--text-muted); font-size: 0.82rem; }

    .difficulty-badge {
      font-size: 0.72rem; font-weight: 600; padding: 3px 12px;
      border-radius: var(--radius-pill); text-transform: uppercase; letter-spacing: 0.05em;
      &.easy   { background: rgba(16,185,129,0.15); color: var(--accent-green); }
      &.medium { background: rgba(168,85,247,0.15); color: var(--accent-violet); }
      &.hard   { background: rgba(248,113,113,0.15); color: #f87171; }
    }

    .actions {
      display: flex; align-items: center; gap: 16px; width: 100%; max-width: 640px;
      justify-content: space-between;
    }
    .nav-btn {
      width: 44px; height: 44px; border-radius: 50%;
      background: var(--bg-card); border: 1px solid var(--border);
      color: var(--text-secondary); display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
      &:hover:not(:disabled) { border-color: var(--accent-violet); color: var(--text-primary); }
      &:disabled { opacity: 0.35; cursor: not-allowed; }
    }
    .rating-btns { display: flex; gap: 12px; }
    .btn-practice {
      background: var(--bg-card); border: 1px solid var(--border);
      color: var(--text-secondary); font-size: 0.875rem; font-weight: 600;
      padding: 11px 22px; border-radius: var(--radius-pill);
      transition: all 0.2s;
      &:hover:not(:disabled) { border-color: #f87171; color: #f87171; background: rgba(248,113,113,0.08); }
      &:disabled { opacity: 0.45; cursor: not-allowed; }
    }
    .btn-mastered {
      display: flex; align-items: center; gap: 7px;
      background: var(--grad-green); color: #fff;
      font-size: 0.875rem; font-weight: 600;
      padding: 11px 22px; border-radius: var(--radius-pill);
      transition: opacity 0.2s, transform 0.15s;
      &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
      &:disabled { opacity: 0.45; cursor: not-allowed; }
    }

    .completed-banner {
      display: flex; align-items: center; gap: 16px;
      background: linear-gradient(135deg, rgba(251,191,36,0.1), rgba(16,185,129,0.1));
      border: 1px solid rgba(251,191,36,0.3);
      border-radius: var(--radius-lg); padding: 20px 28px; width: 100%; max-width: 640px;
      font-size: 2rem;
      .completed-title { font-weight: 700; color: #fbbf24; }
      .completed-sub { color: var(--text-secondary); font-size: 0.85rem; margin-top: 2px; }
    }

    .dot-row {
      display: flex; flex-wrap: wrap; gap: 6px;
      justify-content: center; margin-top: 8px; max-width: 640px;
    }
    .dot {
      width: 10px; height: 10px; border-radius: 50%;
      background: var(--bg-card); border: 1px solid var(--border);
      transition: all 0.2s; padding: 0;
      &.current  { background: var(--accent-violet); border-color: var(--accent-violet); transform: scale(1.3); }
      &.mastered { background: var(--accent-green); border-color: var(--accent-green); }
      &.practiced { background: #f87171; border-color: #f87171; }
      &:hover    { transform: scale(1.4); }
    }

    .loading-wrap {
      display: flex; flex-direction: column; align-items: center; gap: 16px; padding: 100px 0;
      .spinner-lg { width: 40px; height: 40px; border: 3px solid var(--border); border-top-color: var(--accent-violet); border-radius: 50%; animation: spin 0.8s linear infinite; }
      p { color: var(--text-secondary); }
    }
    @keyframes spin { to { transform: rotate(360deg); } }
  `],
})
export class FlashcardsComponent implements OnInit {
  currentIndex = 0;
  isFlipped = false;

  get currentCard(): Flashcard | undefined {
    return this.svc.flashcards()[this.currentIndex];
  }

  progress = computed(() => this.svc.getProgress());

  get progressPct(): number {
    const p = this.progress();
    return p.total > 0 ? Math.round((p.mastered / p.total) * 100) : 0;
  }

  constructor(public svc: LearningService) {}

  ngOnInit(): void {
    this.svc.getFlashcards().subscribe();
  }

  flip(): void {
    this.isFlipped = !this.isFlipped;
  }

  next(): void {
    if (this.currentIndex < this.svc.flashcards().length - 1) {
      this.currentIndex++;
      this.isFlipped = false;
    }
  }

  prev(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.isFlipped = false;
    }
  }

  goTo(index: number): void {
    this.currentIndex = index;
    this.isFlipped = false;
  }

  // Click event #8: Shuffle → API request
  shuffle(): void {
    this.svc.shuffleFlashcards().subscribe(() => {
      this.currentIndex = 0;
      this.isFlipped = false;
    });
  }

  // Reset → API request
  reset(): void {
    this.svc.resetFlashcards().subscribe(() => {
      this.currentIndex = 0;
      this.isFlipped = false;
    });
  }

  // Delete all flashcards
  clearAll(): void {
    if (!confirm('Delete all flashcards? This cannot be undone.')) return;
    this.svc.clearAllFlashcards().subscribe(() => {
      this.currentIndex = 0;
      this.isFlipped = false;
    });
  }

  // Click event #9: Mark mastered → API request
  markMastered(): void {
    if (!this.currentCard) return;
    this.svc.markMastered(this.currentCard.id).subscribe(() => {
      setTimeout(() => this.next(), 400);
    });
  }

  // Click event #10: Mark needs practice → API request
  markNeedsPractice(): void {
    if (!this.currentCard) return;
    this.svc.markNeedsPractice(this.currentCard.id).subscribe(() => {
      setTimeout(() => this.next(), 400);
    });
  }
}
