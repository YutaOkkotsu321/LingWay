import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/grammar', pathMatch: 'full' },

  // Public routes
  { path: 'login',    loadComponent: () => import('./components/login/login.component').then(m => m.LoginComponent) },
  { path: 'register', loadComponent: () => import('./components/register/register.component').then(m => m.RegisterComponent) },

  // Protected routes (6 named routes)
  { path: 'grammar',        canActivate: [authGuard], loadComponent: () => import('./components/grammar/grammar.component').then(m => m.GrammarComponent) },
  { path: 'grammar/:id',    canActivate: [authGuard], loadComponent: () => import('./components/grammar-detail/grammar-detail.component').then(m => m.GrammarDetailComponent) },
  { path: 'vocabulary',     canActivate: [authGuard], loadComponent: () => import('./components/vocabulary/vocabulary.component').then(m => m.VocabularyComponent) },
  { path: 'flashcards',     canActivate: [authGuard], loadComponent: () => import('./components/flashcards/flashcards.component').then(m => m.FlashcardsComponent) },
  { path: 'add-cards',      canActivate: [authGuard], loadComponent: () => import('./components/add-cards/add-cards.component').then(m => m.AddCardsComponent) },
  { path: 'profile',        canActivate: [authGuard], loadComponent: () => import('./components/profile/profile.component').then(m => m.ProfileComponent) },

  { path: '**', redirectTo: '/grammar' },
];
