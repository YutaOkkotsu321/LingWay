import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LearningService } from '../../services/learning.service';
import { Flashcard, NewFlashcard } from '../../core/models';

@Component({
  selector: 'app-add-flashcard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">Add Flashcard</h2>
        <p class="page-sub">Create your own cards. They show up in the Flashcards tab.</p>
      </div>

      <div class="layout">
        <form class="form-card" (ngSubmit)="submit()" #f="ngForm">
          <div class="field">
            <label>Question</label>
            <input
              type="text"
              name="question"
              [(ngModel)]="draft.question"
              required
              maxlength="300"
              placeholder="e.g. What is the past tense of 'run'?"
            />
          </div>

          <div class="field">
            <label>Answer</label>
            <input
              type="text"
              name="answer"
              [(ngModel)]="draft.answer"
              required
              maxlength="300"
              placeholder="e.g. ran"
            />
          </div>

          <div class="row">
            <div class="field">
              <label>Category</label>
              <input
                type="text"
                name="category"
                [(ngModel)]="draft.category"
                maxlength="60"
                placeholder="Custom"
              />
            </div>

            <div class="field">
              <label>Difficulty</label>
              <select name="difficulty" [(ngModel)]="draft.difficulty">
                <option value="easy">easy</option>
                <option value="medium">medium</option>
                <option value="hard">hard</option>
              </select>
            </div>
          </div>

          @if (error()) {
            <div class="error-banner">{{ error() }}</div>
          }
          @if (justAdded()) {
            <div class="success-banner">Card added.</div>
          }

          <div class="actions">
            <button type="submit" class="btn-primary" [disabled]="!f.valid || busy()">
              {{ busy() ? 'Saving...' : 'Add Flashcard' }}
            </button>
            <button
              type="button"
              class="btn-outline"
              (click)="goToFlashcards()"
            >Open Flashcards →</button>
          </div>
        </form>

        <div class="side-card">
          <h3>Your cards ({{ userCardCount() }})</h3>
          @if (userCardCount() === 0) {
            <p class="empty">You haven't added any cards yet.</p>
          } @else {
            <ul class="card-list">
              @for (c of userCards(); track c.id) {
                <li>
                  <span class="q">{{ c.question }}</span>
                  <span class="a">{{ c.answer }}</span>
                </li>
              }
            </ul>
          }

          <button
            type="button"
            class="btn-danger"
            (click)="clean()"
            [disabled]="busy() || userCardCount() === 0"
          >Clean all my cards</button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .page { max-width: 1000px; margin: 0 auto; padding: 48px 60px 80px; }
    .page-header { margin-bottom: 28px; }
    .page-title { font-size: 2.2rem; font-weight: 800; }
    .page-sub { color: var(--text-secondary); font-size: 0.95rem; margin-top: 6px; }

    .layout { display: grid; grid-template-columns: 1fr 320px; gap: 24px; align-items: start; }
    @media (max-width: 800px) { .layout { grid-template-columns: 1fr; } }

    .form-card, .side-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
    }
    .btn-danger {
      padding: 10px 20px;
      color: purple;
      font-size: 20px;
    }
    .field { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
    .field label { font-size: 0.82rem; color: var(--text-secondary); font-weight: 600; }
    .field input, .field select {
      background: var(--bg-secondary); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 10px 12px;
      color: var(--text-primary); font-size: 0.9rem;
    }
    .field input:focus, .field select:focus {
      outline: none; border-color: var(--accent-violet);
    }

    .row { display: grid; grid-template-columns: 1fr 180px; gap: 16px; }
    @media (max-width: 600px) { .row { grid-template-columns: 1fr; } }

    .actions { display: flex; gap: 10px; margin-top: 8px; }

    .error-banner {
      background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.3);
      color: #f87171; padding: 10px 14px; border-radius: var(--radius);
      font-size: 0.85rem; margin-bottom: 12px;
    }
    .success-banner {
      background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.3);
      color: var(--accent-green); padding: 10px 14px; border-radius: var(--radius);
      font-size: 0.85rem; margin-bottom: 12px;
    }

    .side-card h3 { font-size: 1rem; font-weight: 700; margin-bottom: 14px; }
    .empty { color: var(--text-muted); font-size: 0.85rem; margin-bottom: 16px; }
    .card-list {
      list-style: none; padding: 0; margin: 0 0 16px 0;
      display: flex; flex-direction: column; gap: 8px;
      max-height: 300px; overflow-y: auto;
    }
    .card-list li {
      display: flex; flex-direction: column; gap: 2px;
      padding: 10px 12px; background: var(--bg-secondary);
      border: 1px solid var(--border); border-radius: var(--radius);
      font-size: 0.85rem;
    }
    .card-list .q { color: var(--text-primary); font-weight: 500; }
    .card-list .a { color: var(--text-secondary); font-size: 0.8rem; }
  `],
})
export class AddFlashcardComponent implements OnInit {
  draft: NewFlashcard = { question: '', answer: '', category: '', difficulty: 'easy' };
  busy = signal(false);
  error = signal<string | null>(null);
  justAdded = signal(false);

  constructor(public svc: LearningService, private router: Router) {}

  ngOnInit(): void {
    if (this.svc.flashcards().length === 0) {
      this.svc.getFlashcards().subscribe();
    }
  }

  userCards(): Flashcard[] {
    return this.svc.flashcards();
  }

  userCardCount(): number {
    return this.userCards().length;
  }

  submit(): void {
    if (this.busy()) return;
    this.busy.set(true);
    this.error.set(null);
    this.justAdded.set(false);

    this.svc.addFlashcard({
      question: this.draft.question.trim(),
      answer: this.draft.answer.trim(),
      category: (this.draft.category || '').trim() || undefined,
      difficulty: this.draft.difficulty,
    }).subscribe({
      next: () => {
        this.busy.set(false);
        this.justAdded.set(true);
        this.draft = { question: '', answer: '', category: '', difficulty: 'easy' };
        setTimeout(() => this.justAdded.set(false), 2500);
      },
      error: (err) => {
        this.busy.set(false);
        this.error.set(err?.error?.error ?? 'Failed to save card. Are you logged in?');
      },
    });
  }

  clean(): void {
    if (this.busy() || this.userCardCount() === 0) return;
    if (!confirm('Delete all your custom flashcards? This cannot be undone.')) return;

    this.busy.set(true);
    this.error.set(null);
    this.svc.clearUserFlashcards().subscribe({
      next: () => this.busy.set(false),
      error: () => {
        this.busy.set(false);
        this.error.set('Failed to clear cards.');
      },
    });
  }

  goToFlashcards(): void {
    this.router.navigate(['/flashcards']);
  }
}
