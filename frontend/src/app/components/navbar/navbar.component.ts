import { Component, OnInit, signal } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

interface Me {
  authenticated: boolean;
  username?: string;
  profile_url?: string;
  logout_url?: string;
}

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
          <a routerLink="/grammar"    routerLinkActive="active" class="nav-link">Grammar</a>
          <a routerLink="/vocabulary" routerLinkActive="active" class="nav-link">Vocabulary</a>
          <a routerLink="/flashcards" routerLinkActive="active" class="nav-link">Flashcards</a>
          <a routerLink="/add-flashcard" routerLinkActive="active" class="nav-link">Add Flashcard</a>
          <a [href]="djangoBase + '/accounts/profile/'" class="nav-link">Profile</a>
        </div>

        <div class="nav-right">
          @if (me()?.authenticated) {
            <span class="username">{{ me()?.username }}</span>
            <form [action]="djangoBase + '/accounts/logout/'" method="post" #logoutForm>
              <input type="hidden" name="csrfmiddlewaretoken" [value]="csrfToken()" />
              <button type="submit" class="btn-logout">Logout</button>
            </form>
          } @else {
            <a [href]="djangoBase + '/accounts/login/'" class="btn-logout">Sign in</a>
          }
        </div>
      </div>
    </nav>
  `,
  styles: [`
    .header { background: var(--bg-secondary); padding: 28px 0 20px; border-bottom: 1px solid var(--border); }
    .header-inner { max-width: 1200px; margin: 0 auto; padding: 0 60px; }
    .brand-title {
      display: block; font-size: 3rem; font-weight: 800;
      background: var(--grad-title);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      line-height: 1.1;
    }
    .brand-sub { display: block; color: var(--text-secondary); font-size: 0.95rem; margin-top: 4px; }
    .navbar { background: var(--bg-secondary); border-bottom: 1px solid var(--border); position: sticky; top: 0; z-index: 100; }
    .nav-inner {
      max-width: 1200px; margin: 0 auto; padding: 0 60px;
      display: flex; align-items: center; justify-content: space-between; height: 56px;
    }
    .nav-links { display: flex; gap: 4px; }
    .nav-link {
      display: flex; align-items: center; gap: 8px; padding: 8px 18px;
      border-radius: var(--radius-pill);
      color: var(--text-secondary); font-size: 0.9rem; font-weight: 500;
      transition: all 0.2s;
    }
    .nav-link:hover { color: var(--text-primary); background: rgba(255,255,255,0.05); }
    .nav-link.active {
      background: rgba(124, 58, 237, 0.25); color: var(--accent-violet);
      border: 1px solid rgba(124, 58, 237, 0.4);
    }
    .nav-right { display: flex; align-items: center; gap: 14px; }
    .username { color: var(--text-secondary); font-size: 0.875rem; }
    .btn-logout {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 7px 16px; border-radius: var(--radius-pill);
      background: transparent; border: 1px solid var(--border);
      color: var(--text-secondary); font-size: 0.85rem; font-weight: 500;
      transition: all 0.2s;
    }
    .btn-logout:hover { background: rgba(248, 113, 113, 0.1); border-color: rgba(248, 113, 113, 0.4); color: #f87171; }
  `],
})
export class NavbarComponent implements OnInit {
  readonly djangoBase = 'http://localhost:8000';
  me = signal<Me | null>(null);
  csrfToken = signal<string>('');

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.http.get<Me>(`${this.djangoBase}/api/auth/me/`, { withCredentials: true }).subscribe({
      next: (me) => this.me.set(me),
      error: () => {
        this.me.set({ authenticated: false });
        window.location.href = `${this.djangoBase}/accounts/login/`;
      },
    });

    this.csrfToken.set(this.readCookie('csrftoken'));
  }

  private readCookie(name: string): string {
    const match = document.cookie.match(new RegExp('(^|;\\s*)(' + name + ')=([^;]*)'));
    return match ? decodeURIComponent(match[3]) : '';
  }
}
