import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [FormsModule, RouterLink, CommonModule],
  template: `
    <div class="auth-page">
      <div class="auth-card fade-in-up">
        <div class="auth-brand">
          <h1>English Learning</h1>
          <p>Start your language journey today</p>
        </div>

        <div class="auth-body">
          <h2>Create account</h2>
          <p class="auth-subtitle">Join thousands of learners worldwide</p>

          @if (successMsg) {
            <div class="success-banner">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
              {{ successMsg }}
            </div>
          }

          <!-- Form control #3: username -->
          <div class="field">
            <label>Username</label>
            <input type="text" [(ngModel)]="username" name="username" placeholder="Choose a username" [class.error]="errors['username']" />
            @if (errors['username']) { <p class="field-err">{{ errors['username'] }}</p> }
          </div>

          <!-- Form control #4: email -->
          <div class="field">
            <label>Email address</label>
            <input type="email" [(ngModel)]="email" name="email" placeholder="you@example.com" [class.error]="errors['email']" />
            @if (errors['email']) { <p class="field-err">{{ errors['email'] }}</p> }
          </div>

          <!-- Form control #5: password -->
          <div class="field">
            <label>Password</label>
            <input [type]="showPwd ? 'text' : 'password'" [(ngModel)]="password" name="password" placeholder="At least 8 characters" [class.error]="errors['password']" />
            @if (errors['password']) { <p class="field-err">{{ errors['password'] }}</p> }
          </div>

          <!-- Form control #6: confirm password -->
          <div class="field">
            <label>Confirm Password</label>
            <input [type]="showPwd ? 'text' : 'password'" [(ngModel)]="confirmPassword" name="confirmPassword" placeholder="Repeat your password" [class.error]="errors['confirmPassword']" />
            @if (errors['confirmPassword']) { <p class="field-err">{{ errors['confirmPassword'] }}</p> }
          </div>

          <div class="show-pwd">
            <input type="checkbox" id="showPwd" [(ngModel)]="showPwd" name="showPwd" />
            <label for="showPwd">Show passwords</label>
          </div>

          @if (auth.authError()) {
            <div class="api-error">
              <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
              {{ auth.authError() }}
            </div>
          }

          <!-- Click event #2: Register → API request -->
          <button class="btn-primary" (click)="register()" [disabled]="auth.isLoading()">
            @if (auth.isLoading()) {
              <span class="spinner"></span> Creating account...
            } @else {
              Create Account
            }
          </button>

          <p class="switch-auth">
            Already have an account?
            <a routerLink="/login">Sign in</a>
          </p>
        </div>
      </div>

      <div class="auth-deco">
        <div class="deco-circle c1"></div>
        <div class="deco-circle c2"></div>
      </div>
    </div>
  `,
  styles: [`
    .auth-page {
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      background: var(--bg-primary);
      position: relative; overflow: hidden;
    }
    .auth-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      width: 440px;
      box-shadow: var(--shadow-card);
      position: relative; z-index: 2;
    }
    .auth-brand {
      background: linear-gradient(135deg, rgba(124,58,237,0.3), rgba(129,140,248,0.15));
      padding: 28px 36px;
      border-bottom: 1px solid var(--border);
      h1 {
        font-size: 1.6rem; font-weight: 800;
        background: var(--grad-title);
        -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;
      }
      p { color: var(--text-secondary); font-size: 0.85rem; margin-top: 4px; }
    }
    .auth-body {
      padding: 28px 36px 36px;
      h2 { font-size: 1.35rem; font-weight: 700; }
      .auth-subtitle { color: var(--text-secondary); font-size: 0.88rem; margin-top: 4px; margin-bottom: 24px; }
    }
    .success-banner {
      display: flex; align-items: center; gap: 8px;
      background: rgba(16,185,129,0.1);
      border: 1px solid rgba(16,185,129,0.25);
      border-radius: var(--radius); color: var(--accent-green);
      font-size: 0.85rem; padding: 10px 14px; margin-bottom: 16px;
    }
    .field { margin-bottom: 16px; }
    label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
    input[type=text], input[type=email], input[type=password] {
      width: 100%;
      background: var(--bg-input); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 10px 14px;
      color: var(--text-primary); font-size: 0.9rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      &:focus { border-color: var(--accent-violet); box-shadow: 0 0 0 3px rgba(168,85,247,0.15); }
      &.error { border-color: #f87171; }
      &::placeholder { color: var(--text-muted); }
    }
    .field-err { color: #f87171; font-size: 0.78rem; margin-top: 4px; }
    .show-pwd {
      display: flex; align-items: center; gap: 8px;
      margin: 4px 0 14px;
      input[type=checkbox] { accent-color: var(--accent-violet); }
      label { margin: 0; font-size: 0.82rem; cursor: pointer; }
    }
    .api-error {
      display: flex; align-items: center; gap: 8px;
      background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25);
      border-radius: var(--radius); color: #f87171;
      font-size: 0.85rem; padding: 10px 14px; margin-bottom: 14px;
    }
    .btn-primary {
      width: 100%; background: var(--grad-btn); color: #fff;
      font-size: 0.95rem; font-weight: 600; padding: 12px; border-radius: var(--radius);
      display: flex; align-items: center; justify-content: center; gap: 8px;
      transition: opacity 0.2s, transform 0.15s;
      &:hover:not(:disabled) { opacity: 0.9; transform: translateY(-1px); }
      &:disabled { opacity: 0.55; cursor: not-allowed; }
    }
    .spinner {
      width: 16px; height: 16px;
      border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff;
      border-radius: 50%; animation: spin 0.6s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }
    .switch-auth {
      text-align: center; margin-top: 18px;
      font-size: 0.875rem; color: var(--text-secondary);
      a { color: var(--accent-violet); font-weight: 500; &:hover { text-decoration: underline; } }
    }
    .auth-deco { position: absolute; inset: 0; pointer-events: none; }
    .deco-circle {
      position: absolute; border-radius: 50%; filter: blur(80px); opacity: 0.2;
    }
    .c1 { width: 350px; height: 350px; background: var(--accent-purple); top: -150px; left: -100px; }
    .c2 { width: 300px; height: 300px; background: var(--accent-indigo); bottom: -120px; right: -80px; }
  `],
})
export class RegisterComponent {
  username = '';
  email = '';
  password = '';
  confirmPassword = '';
  showPwd = false;
  errors: Record<string, string> = {};
  successMsg = '';

  constructor(public auth: AuthService, private router: Router) {}

  // Click event #2: Register → triggers API request
  register(): void {
    this.errors = {};
    this.successMsg = '';

    if (!this.username.trim())       this.errors['username'] = 'Username is required.';
    if (!this.email.trim())          this.errors['email'] = 'Email is required.';
    else if (!this.email.includes('@')) this.errors['email'] = 'Enter a valid email address.';
    if (this.password.length < 8)    this.errors['password'] = 'Password must be at least 8 characters.';
    if (this.password !== this.confirmPassword) this.errors['confirmPassword'] = 'Passwords do not match.';

    if (Object.keys(this.errors).length) return;

    this.auth.register({
      username: this.username,
      email: this.email,
      password: this.password,
      confirmPassword: this.confirmPassword,
    }).subscribe({
      next: () => {
        this.successMsg = 'Account created! Redirecting to login...';
        setTimeout(() => this.router.navigate(['/login']), 1500);
      },
      error: () => {},
    });
  }
}
