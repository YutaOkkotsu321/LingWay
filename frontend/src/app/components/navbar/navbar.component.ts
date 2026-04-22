import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, CommonModule],
  template: `
    <header class="header">
      <div class="header-inner">
        <div class="brand">
          <span class="brand-title">English Learning</span>
          <span class="brand-sub">Comprehensive language education platform</span>
        </div>
      </div>
    </header>

    <nav class="navbar">
      <div class="nav-inner">
        <div class="nav-links">
          <a routerLink="/grammar"    routerLinkActive="active" class="nav-link">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            Grammar
          </a>
          <a routerLink="/vocabulary" routerLinkActive="active" class="nav-link">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/></svg>
            Vocabulary
          </a>
          <a routerLink="/flashcards" routerLinkActive="active" class="nav-link">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"/></svg>
            Flashcards
          </a>
          <a routerLink="/add-cards"  routerLinkActive="active" class="nav-link">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4"/></svg>
            Add Cards
          </a>
          <a routerLink="/profile"    routerLinkActive="active" class="nav-link">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg>
            Profile
          </a>
        </div>

        <div class="nav-right">
          @if (auth.currentUser()) {
            <span class="username">{{ auth.currentUser()?.username }}</span>
          }
          <!-- Click event #3: Logout triggers API call -->
          <button class="btn-logout" (click)="logout()">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
            Logout
          </button>
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .header {
      background: var(--bg-secondary);
      padding: 28px 0 20px;
      border-bottom: 1px solid var(--border);
    }
    .header-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 60px;
    }
    .brand-title {
      display: block;
      font-size: 3rem;
      font-weight: 800;
      background: var(--grad-title);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      line-height: 1.1;
    }
    .brand-sub {
      display: block;
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin-top: 4px;
    }
    .navbar {
      background: var(--bg-secondary);
      border-bottom: 1px solid var(--border);
      position: sticky;
      top: 0;
      z-index: 100;
    }
    .nav-inner {
      max-width: 1200px;
      margin: 0 auto;
      padding: 0 60px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 56px;
    }
    .nav-links { display: flex; gap: 4px; }
    .nav-link {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 8px 18px;
      border-radius: var(--radius-pill);
      color: var(--text-secondary);
      font-size: 0.9rem;
      font-weight: 500;
      transition: all 0.2s;
      svg { opacity: 0.6; }
    }
    .nav-link:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }
    .nav-link.active {
      background: rgba(124, 58, 237, 0.25);
      color: var(--accent-violet);
      border: 1px solid rgba(124, 58, 237, 0.4);
      svg { opacity: 1; }
    }
    .nav-right { display: flex; align-items: center; gap: 14px; }
    .username { color: var(--text-secondary); font-size: 0.875rem; }
    .btn-logout {
      display: flex;
      align-items: center;
      gap: 6px;
      padding: 7px 16px;
      border-radius: var(--radius-pill);
      background: transparent;
      border: 1px solid var(--border);
      color: var(--text-secondary);
      font-size: 0.85rem;
      font-weight: 500;
      transition: all 0.2s;
    }
    .btn-logout:hover {
      background: rgba(248, 113, 113, 0.1);
      border-color: rgba(248, 113, 113, 0.4);
      color: #f87171;
    }
  `],
})
export class NavbarComponent {
  constructor(public auth: AuthService) {}

  // Click event #3: Logout → API call
  logout(): void {
    this.auth.logout();
  }
}
