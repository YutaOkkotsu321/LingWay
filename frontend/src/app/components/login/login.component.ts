import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in-up">
        <div class="auth-brand">
          <h1>English Learning</h1>
          <p>Comprehensive language education platform</p>
        </div>

        <div class="auth-body">
          <h2>Welcome back</h2>
          <p class="auth-subtitle">Sign in to continue your learning journey</p>

          <!-- Form control #1: username -->
          <div class="field">
            <label for="username">Username</label>
            <input
              id="username"
              type="text"
              [(ngModel)]="username"
              name="username"
              placeholder="Enter your username"
              [class.error]="fieldError && !username"
              autocomplete="username"
            />
          </div>

          <!-- Form control #2: password -->
          <div class="field">
            <label for="password">Password</label>
            <div class="input-wrap">
              <input
                id="password"
                [type]="showPassword ? 'text' : 'password'"
                [(ngModel)]="password"
                name="password"
                placeholder="Enter your password"
                [class.error]="fieldError && !password"
                autocomplete="current-password"
              />
              <!-- Click event #1 (non-API): toggle password visibility -->
              <button class="eye-btn" type="button" (click)="showPassword = !showPassword">
                @if (!showPassword) {
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/></svg>
                } @else {
                  <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/></svg>
                }
              </button>
            </div>
          </div>

          @if (fieldError) {
            <p class="error-msg">{{ fieldError }}</p>
          }

          @if (auth.authError()) {
            <div class="api-error">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ auth.authError() }}
            </div>
          }

          <!-- Click event #1: Login → API request -->
          <button
            class="btn-primary"
            (click)="login()"
            [disabled]="auth.isLoading()"
          >
            @if (auth.isLoading()) {
              <span class="spinner"></span> Signing in...
            } @else {
              Sign In
            }
          </button>

          <p class="switch-auth">
            Don't have an account?
            <a routerLink="/register">Create one</a>
          </p>
        </div>
      </div>

      <div class="auth-deco">
        <div class="deco-circle c1"></div>
        <div class="deco-circle c2"></div>
        <div class="deco-circle c3"></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-primary);
      position: relative;
      overflow: hidden;
    }
    .auth-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      width: 420px;
      overflow: hidden;
      box-shadow: var(--shadow-card);
      position: relative;
      z-index: 2;
    }
    .auth-brand {
      background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(129,140,248,0.15));
      padding: 32px 36px 28px;
      border-bottom: 1px solid var(--border);
      h1 {
        font-size: 1.7rem;
        font-weight: 800;
        background: var(--grad-title);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
      }
      p { color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px; }
    }
    .auth-body {
      padding: 32px 36px 36px;
      h2 { font-size: 1.4rem; font-weight: 700; }
      .auth-subtitle { color: var(--text-secondary); font-size: 0.88rem; margin-top: 4px; margin-bottom: 28px; }
    }
    .field { margin-bottom: 18px; }
    label { display: block; font-size: 0.83rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 7px; letter-spacing: 0.02em; }
    .input-wrap { position: relative; }
    input[type=text], input[type=password], input[type=email] {
      width: 100%;
      background: var(--bg-input);
      border: 1px solid var(--border);
      border-radius: var(--radius);
      padding: 11px 14px;
      color: var(--text-primary);
      font-size: 0.93rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      &:focus { border-color: var(--accent-violet); box-shadow: 0 0 0 3px rgba(168,85,247,0.15); }
      &.error { border-color: #f87171; }
      &::placeholder { color: var(--text-muted); }
    }
    .input-wrap input { padding-right: 42px; }
    .eye-btn {
      position: absolute;
      right: 12px; top: 50%;
      transform: translateY(-50%);
      background: none;
      color: var(--text-muted);
      padding: 2px;
      &:hover { color: var(--text-primary); }
    }
    .api-error {
      display: flex; align-items: center; gap: 8px;
      background: rgba(248,113,113,0.1);
      border: 1px solid rgba(248,113,113,0.25);
      border-radius: var(--radius);
      color: #f87171;
      font-size: 0.85rem;
      padding: 10px 14px;
      margin-bottom: 16px;
    }
    .btn-primary {
      width: 100%;
      background: var(--grad-btn);
      color: #fff;
      font-size: 0.95rem;
      font-weight: 600;
      padding: 12px;
      border-radius: var(--radius);
      margin-top: 8px;
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: opacity 0.2s, transform 0.15s;
      &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
      &:disabled { opacity: 0.55; cursor: not-allowed; }
    }
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3);
      border-top-color: #fff;
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .switch-auth {
      text-align: center;
      margin-top: 20px;
      font-size: 0.875rem;
      color: var(--text-secondary);
      a { color: var(--accent-violet); font-weight: 500; &:hover { text-decoration: underline; } }
    }
    .auth-deco { position: absolute; inset: 0; pointer-events: none; }
    .deco-circle {
      position: absolute;
      border-radius: 50%;
      filter: blur(80px);
      opacity: 0.25;
    }
    .c1 { width: 400px; height: 400px; background: var(--accent-purple); top: -200px; right: -100px; }
    .c2 { width: 300px; height: 300px; background: var(--accent-indigo); bottom: -150px; left: -80px; }
    .c3 { width: 200px; height: 200px; background: var(--accent-green); top: 50%; left: 50%; }
  `],
})
export class LoginComponent {
  username = '';
  password = '';
  showPassword = false;
  fieldError = '';

  constructor(public auth: AuthService, private router: Router) {}

  // Click event #1: Login → triggers API request
  login(): void {
    this.fieldError = '';
    if (!this.username.trim()) { this.fieldError = 'Username is required.'; return; }
    if (!this.password.trim()) { this.fieldError = 'Password is required.'; return; }

    this.auth.login({ username: this.username, password: this.password }).subscribe({
      next: () => this.router.navigate(['/grammar']),
      error: () => {},
    });
  }
}
