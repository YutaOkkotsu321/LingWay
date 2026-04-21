import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', redirectTo: '/grammar', pathMatch: 'full' },

  { path: 'grammar',        loadComponent: () => import('./components/grammar/grammar.component').then(m => m.GrammarComponent) },
  { path: 'grammar/:id',    loadComponent: () => import('./components/grammar-detail/grammar-detail.component').then(m => m.GrammarDetailComponent) },
  { path: 'vocabulary',     loadComponent: () => import('./components/vocabulary/vocabulary.component').then(m => m.VocabularyComponent) },
  { path: 'flashcards',     loadComponent: () => import('./components/flashcards/flashcards.component').then(m => m.FlashcardsComponent) },
  { path: 'add-flashcard',  loadComponent: () => import('./components/add-flashcard/add-flashcard.component').then(m => m.AddFlashcardComponent) },

  { path: '**', redirectTo: '/grammar' },
];
