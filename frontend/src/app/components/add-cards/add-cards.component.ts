import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { LearningService } from '../../services/learning.service';

@Component({
  selector: 'app-add-cards',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
    <div class="page">
      <div class="page-header">
        <div>
          <h2 class="page-title">Add Cards</h2>
          <p class="page-sub">Create your own flashcards to practice</p>
        </div>
        <a routerLink="/flashcards" class="view-btn">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
          View Flashcards
        </a>
      </div>

      <div class="form-card">
        <form (ngSubmit)="onSubmit()" #cardForm="ngForm" class="form">
          <div class="field">
            <label for="question">Question</label>
            <textarea
              id="question"
              name="question"
              [(ngModel)]="question"
              required
              minlength="2"
              rows="3"
              placeholder="e.g. What is the past tense of 'go'?"
            ></textarea>
          </div>

          <div class="field">
            <label for="answer">Answer</label>
            <textarea
              id="answer"
              name="answer"
              [(ngModel)]="answer"
              required
              minlength="1"
              rows="3"
              placeholder="e.g. went"
            ></textarea>
          </div>

          <div class="row">
            <div class="field">
              <label for="category">Category</label>
              <input
                id="category"
                name="category"
                type="text"
                [(ngModel)]="category"
                placeholder="e.g. Irregular Verbs"
              />
            </div>

            <div class="field">
              <label for="difficulty">Difficulty</label>
              <select id="difficulty" name="difficulty" [(ngModel)]="difficulty">
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>
          </div>

          <div class="actions">
            <button type="button" class="btn-reset" (click)="resetForm()" [disabled]="submitting">Clear</button>
            <button type="submit" class="btn-submit" [disabled]="!cardForm.form.valid || submitting">
              @if (submitting) {
                <span class="spinner"></span>
                Adding...
              } @else {
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
                Add Card
              }
            </button>
          </div>
        </form>

        @if (successMessage) {
          <div class="success-banner fade-in-up">
            <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
            {{ successMessage }}
          </div>
        }
      </div>

      <div class="preview-section">
        <h3 class="preview-title">
          Your Cards
          <span class="count-badge">{{ svc.flashcards().length }}</span>
        </h3>
        <div class="preview-grid">
          @for (card of svc.flashcards(); track card.id) {
            <div class="preview-card">
              <div class="preview-meta">
                <span class="chip">{{ card.category }}</span>
                <span class="chip diff" [class]="card.difficulty">{{ card.difficulty }}</span>
              </div>
              <p class="preview-q">{{ card.question }}</p>
              <p class="preview-a">{{ card.answer }}</p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page {
      max-width: 900px;
      margin: 0 auto;
      padding: 48px 60px 80px;
    }
    .page-header {
      display: flex;
      align-items: flex-end;
      justify-content: space-between;
      margin-bottom: 28px;
      gap: 16px;
    }
    .page-title { font-size: 2.2rem; font-weight: 800; }
    .page-sub { color: var(--text-secondary); font-size: 0.95rem; margin-top: 6px; }

    .view-btn {
      display: flex; align-items: center; gap: 7px;
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-pill);
      color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;
      padding: 8px 18px; transition: all 0.2s;
      &:hover { border-color: var(--accent-violet); color: var(--text-primary); }
    }

    .form-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
      box-shadow: var(--shadow-card);
      margin-bottom: 36px;
    }
    .form { display: flex; flex-direction: column; gap: 18px; }
    .row { display: flex; gap: 16px; }
    .row .field { flex: 1; }

    .field { display: flex; flex-direction: column; gap: 6px; }
    .field label {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-secondary);
      letter-spacing: 0.03em;
    }
    .field input, .field textarea, .field select {
      background: var(--bg-secondary);
      border: 1px solid var(--border);
      border-radius: var(--radius-md, 10px);
      padding: 10px 14px;
      color: var(--text-primary);
      font-size: 0.95rem;
      font-family: inherit;
      transition: border-color 0.2s, box-shadow 0.2s;
      &:focus {
        outline: none;
        border-color: var(--accent-violet);
        box-shadow: 0 0 0 3px rgba(124,58,237,0.15);
      }
    }
    .field textarea { resize: vertical; min-height: 70px; }

    .actions {
      display: flex; justify-content: flex-end; gap: 12px; margin-top: 6px;
    }
    .btn-reset {
      background: transparent; border: 1px solid var(--border);
      color: var(--text-secondary); font-size: 0.875rem; font-weight: 600;
      padding: 10px 20px; border-radius: var(--radius-pill);
      transition: all 0.2s;
      &:hover:not(:disabled) { border-color: var(--text-secondary); color: var(--text-primary); }
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
    .btn-submit {
      display: flex; align-items: center; gap: 7px;
      background: var(--grad-green); color: #fff;
      font-size: 0.875rem; font-weight: 600;
      padding: 10px 22px; border-radius: var(--radius-pill);
      border: none;
      transition: opacity 0.2s, transform 0.15s;
      &:hover:not(:disabled) { opacity: 0.92; transform: translateY(-1px); }
      &:disabled { opacity: 0.45; cursor: not-allowed; }
    }

    .spinner {
      width: 14px; height: 14px;
      border: 2px solid rgba(255,255,255,0.4);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.7s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .success-banner {
      display: flex; align-items: center; gap: 10px;
      margin-top: 18px;
      background: rgba(16,185,129,0.1);
      border: 1px solid rgba(16,185,129,0.3);
      color: var(--accent-green);
      padding: 10px 16px;
      border-radius: var(--radius-md, 10px);
      font-size: 0.88rem;
      font-weight: 500;
    }

    .preview-section { margin-top: 12px; }
    .preview-title {
      display: flex; align-items: center; gap: 10px;
      font-size: 1.2rem; font-weight: 700;
      margin-bottom: 16px;
    }
    .count-badge {
      background: rgba(124,58,237,0.2);
      color: var(--accent-violet);
      font-size: 0.75rem; font-weight: 700;
      padding: 2px 10px;
      border-radius: var(--radius-pill);
    }
    .preview-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(260px, 1fr));
      gap: 14px;
    }
    .preview-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 16px;
      display: flex; flex-direction: column; gap: 8px;
    }
    .preview-meta { display: flex; gap: 6px; flex-wrap: wrap; }
    .chip {
      background: rgba(129,140,248,0.15); color: var(--accent-indigo);
      font-size: 0.72rem; font-weight: 600;
      padding: 3px 10px; border-radius: var(--radius-pill);
      text-transform: capitalize;
    }
    .chip.diff.easy   { background: rgba(16,185,129,0.15); color: var(--accent-green); }
    .chip.diff.medium { background: rgba(168,85,247,0.15); color: var(--accent-violet); }
    .chip.diff.hard   { background: rgba(248,113,113,0.15); color: #f87171; }
    .preview-q {
      font-weight: 600; color: var(--text-primary); font-size: 0.92rem;
      line-height: 1.4;
    }
    .preview-a {
      color: var(--text-secondary); font-size: 0.85rem;
      line-height: 1.4;
    }
  `],
})
export class AddCardsComponent {
  question = '';
  answer = '';
  category = '';
  difficulty: 'easy' | 'medium' | 'hard' = 'medium';
  submitting = false;
  successMessage = '';

  constructor(public svc: LearningService) {}

  onSubmit(): void {
    if (!this.question.trim() || !this.answer.trim() || this.submitting) return;

    this.submitting = true;
    this.successMessage = '';

    this.svc.addFlashcard({
      question: this.question,
      answer: this.answer,
      category: this.category,
      difficulty: this.difficulty,
    }).subscribe({
      next: () => {
        this.submitting = false;
        this.successMessage = 'Card added! You can now see it in Flashcards.';
        this.resetForm();
        setTimeout(() => this.successMessage = '', 3500);
      },
      error: () => {
        this.submitting = false;
      },
    });
  }

  resetForm(): void {
    this.question = '';
    this.answer = '';
    this.category = '';
    this.difficulty = 'medium';
  }
}
