import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../services/auth.service';
import { LearningService } from '../../services/learning.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [FormsModule, CommonModule],
  template: `
    <div class="page">
      <div class="page-header">
        <h2 class="page-title">My Profile</h2>
        <p class="page-sub">Manage your account and track progress</p>
      </div>

      <div class="layout">
        <!-- Left: Profile card -->
        <div class="profile-card">
          <div class="avatar-section">
            <div class="avatar">
              {{ initials }}
            </div>
            <h3>{{ auth.currentUser()?.displayName || auth.currentUser()?.username }}</h3>
            <p class="user-email">{{ auth.currentUser()?.email }}</p>
            <span class="member-badge">Active Learner</span>
          </div>

          <!-- Stats -->
          <div class="stats-grid">
            <div class="stat">
              <span class="stat-num">{{ progress.mastered }}</span>
              <span class="stat-label">Cards Mastered</span>
            </div>
            <div class="stat">
              <span class="stat-num">{{ progress.total }}</span>
              <span class="stat-label">Total Cards</span>
            </div>
            <div class="stat">
              <span class="stat-num">{{ favCount }}</span>
              <span class="stat-label">Saved Words</span>
            </div>
            <div class="stat">
              <span class="stat-num">{{ progressPct }}%</span>
              <span class="stat-label">Completion</span>
            </div>
          </div>
        </div>

        <!-- Right: Edit form -->
        <div class="edit-section">
          <div class="edit-card">
            <h3 class="edit-title">Edit Profile</h3>

            @if (successMsg) {
              <div class="success-banner">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/></svg>
                {{ successMsg }}
              </div>
            }

            @if (auth.authError()) {
              <div class="error-banner">
                <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
                {{ auth.authError() }}
              </div>
            }

            <!-- Form control #8: display name -->
            <div class="field">
              <label>Display Name</label>
              <input type="text" [(ngModel)]="displayName" name="displayName" placeholder="Your display name" />
            </div>

            <!-- Form control #9: bio -->
            <div class="field">
              <label>Bio</label>
              <textarea [(ngModel)]="bio" name="bio" placeholder="Tell us about yourself..." rows="3"></textarea>
            </div>

            <!-- Click event #11 (non-form): Save profile → API request -->
            <button class="btn-save" (click)="saveProfile()" [disabled]="auth.isLoading()">
              @if (auth.isLoading()) {
                <span class="spinner"></span> Saving...
              } @else {
                Save Changes
              }
            </button>
          </div>

          <!-- Change password card -->
          <div class="edit-card">
            <h3 class="edit-title">Change Password</h3>

            <!-- Form control #10: current password -->
            <div class="field">
              <label>Current Password</label>
              <input type="password" [(ngModel)]="currentPwd" name="currentPwd" placeholder="Enter current password" />
            </div>

            <!-- Form control #11: new password -->
            <div class="field">
              <label>New Password</label>
              <input type="password" [(ngModel)]="newPwd" name="newPwd" placeholder="At least 8 characters" />
            </div>

            @if (pwdError) {
              <p class="field-err">{{ pwdError }}</p>
            }

            <!-- Click event #12: Change password → API request -->
            <button class="btn-outline" (click)="changePassword()" [disabled]="changingPwd">
              @if (changingPwd) {
                <span class="spinner dark"></span> Updating...
              } @else {
                Update Password
              }
            </button>
          </div>

          <!-- Danger zone -->
          <div class="danger-card">
            <h3 class="danger-title">Danger Zone</h3>
            <p class="danger-desc">Permanently delete your account and all your data. This action cannot be undone.</p>
            <button class="btn-danger" (click)="confirmDelete()">Delete Account</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete confirmation modal -->
    @if (showDeleteModal) {
      <div class="modal-overlay" (click)="showDeleteModal = false">
        <div class="modal" (click)="$event.stopPropagation()">
          <h3>Are you sure?</h3>
          <p>This will permanently delete your account. Type your username to confirm.</p>
          <input type="text" [(ngModel)]="deleteConfirm" name="deleteConfirm" [placeholder]="auth.currentUser()?.username || 'username'" />
          <div class="modal-actions">
            <button class="btn-outline" (click)="showDeleteModal = false">Cancel</button>
            <button class="btn-danger-confirm" (click)="deleteAccount()" [disabled]="deleteConfirm !== auth.currentUser()?.username">Delete Forever</button>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .page {
      max-width: 1100px;
      margin: 0 auto;
      padding: 48px 60px 80px;
    }
    .page-header { margin-bottom: 36px; }
    .page-title { font-size: 2.2rem; font-weight: 800; }
    .page-sub { color: var(--text-secondary); font-size: 0.95rem; margin-top: 6px; }

    .layout {
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 24px;
      align-items: start;
    }
    @media (max-width: 800px) {
      .layout { grid-template-columns: 1fr; }
    }

    /* Profile card */
    .profile-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      overflow: hidden;
      position: sticky; top: 24px;
    }
    .avatar-section {
      display: flex; flex-direction: column; align-items: center;
      padding: 36px 24px 28px;
      background: linear-gradient(135deg, rgba(124,58,237,0.15), rgba(129,140,248,0.08));
      border-bottom: 1px solid var(--border);
    }
    .avatar {
      width: 80px; height: 80px; border-radius: 50%;
      background: var(--grad-btn);
      display: flex; align-items: center; justify-content: center;
      font-size: 2rem; font-weight: 800; color: #fff;
      margin-bottom: 14px;
      box-shadow: 0 0 0 4px rgba(124,58,237,0.2);
    }
    .avatar-section h3 { font-size: 1.1rem; font-weight: 700; text-align: center; }
    .user-email { color: var(--text-muted); font-size: 0.82rem; margin-top: 4px; text-align: center; }
    .member-badge {
      margin-top: 10px;
      background: rgba(16,185,129,0.15); color: var(--accent-green);
      font-size: 0.72rem; font-weight: 600; padding: 3px 12px;
      border-radius: var(--radius-pill); letter-spacing: 0.04em;
    }
    .stats-grid {
      display: grid; grid-template-columns: 1fr 1fr; gap: 1px;
      background: var(--border);
    }
    .stat {
      background: var(--bg-card);
      display: flex; flex-direction: column; align-items: center;
      padding: 18px 8px; gap: 4px;
      .stat-num { font-size: 1.5rem; font-weight: 800; color: var(--accent-violet); font-family: var(--font-mono); }
      .stat-label { font-size: 0.72rem; color: var(--text-muted); text-align: center; }
    }

    /* Edit section */
    .edit-section { display: flex; flex-direction: column; gap: 20px; }
    .edit-card {
      background: var(--bg-card);
      border: 1px solid var(--border);
      border-radius: var(--radius-lg);
      padding: 28px;
    }
    .edit-title { font-size: 1rem; font-weight: 700; margin-bottom: 20px; }

    .success-banner {
      display: flex; align-items: center; gap: 8px;
      background: rgba(16,185,129,0.1); border: 1px solid rgba(16,185,129,0.25);
      border-radius: var(--radius); color: var(--accent-green);
      font-size: 0.85rem; padding: 10px 14px; margin-bottom: 18px;
    }
    .error-banner {
      display: flex; align-items: center; gap: 8px;
      background: rgba(248,113,113,0.1); border: 1px solid rgba(248,113,113,0.25);
      border-radius: var(--radius); color: #f87171;
      font-size: 0.85rem; padding: 10px 14px; margin-bottom: 18px;
    }
    .field { margin-bottom: 16px; }
    label { display: block; font-size: 0.82rem; font-weight: 600; color: var(--text-secondary); margin-bottom: 6px; }
    input[type=text], input[type=password], input[type=email] {
      width: 100%; background: var(--bg-input); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 10px 14px; color: var(--text-primary); font-size: 0.9rem;
      transition: border-color 0.2s, box-shadow 0.2s;
      &:focus { border-color: var(--accent-violet); box-shadow: 0 0 0 3px rgba(168,85,247,0.15); }
      &::placeholder { color: var(--text-muted); }
    }
    textarea {
      width: 100%; background: var(--bg-input); border: 1px solid var(--border);
      border-radius: var(--radius); padding: 10px 14px; color: var(--text-primary); font-size: 0.9rem;
      font-family: var(--font-main); resize: vertical; min-height: 80px;
      transition: border-color 0.2s, box-shadow 0.2s;
      &:focus { border-color: var(--accent-violet); box-shadow: 0 0 0 3px rgba(168,85,247,0.15); }
      &::placeholder { color: var(--text-muted); }
    }
    .field-err { color: #f87171; font-size: 0.78rem; margin-bottom: 10px; }

    .btn-save {
      background: var(--grad-btn); color: #fff;
      font-size: 0.9rem; font-weight: 600; padding: 11px 24px;
      border-radius: var(--radius); display: flex; align-items: center; gap: 8px;
      transition: opacity 0.2s; width: 100%; justify-content: center;
      &:hover:not(:disabled) { opacity: 0.9; }
      &:disabled { opacity: 0.55; cursor: not-allowed; }
    }
    .btn-outline {
      background: transparent; border: 1px solid var(--border);
      color: var(--text-secondary); font-size: 0.9rem; font-weight: 600;
      padding: 11px 24px; border-radius: var(--radius);
      display: flex; align-items: center; gap: 8px; width: 100%; justify-content: center;
      transition: all 0.2s;
      &:hover:not(:disabled) { border-color: var(--accent-violet); color: var(--text-primary); }
      &:disabled { opacity: 0.55; cursor: not-allowed; }
    }

    .spinner { width: 16px; height: 16px; border: 2px solid rgba(255,255,255,0.3); border-top-color: #fff; border-radius: 50%; animation: spin 0.6s linear infinite; }
    .spinner.dark { border-color: rgba(0,0,0,0.15); border-top-color: var(--accent-violet); }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* Danger zone */
    .danger-card {
      background: rgba(248,113,113,0.05);
      border: 1px solid rgba(248,113,113,0.2);
      border-radius: var(--radius-lg); padding: 24px;
    }
    .danger-title { font-size: 1rem; font-weight: 700; color: #f87171; margin-bottom: 8px; }
    .danger-desc { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 16px; line-height: 1.5; }
    .btn-danger {
      background: rgba(248,113,113,0.15); border: 1px solid rgba(248,113,113,0.35);
      color: #f87171; font-size: 0.875rem; font-weight: 600;
      padding: 10px 20px; border-radius: var(--radius);
      transition: all 0.2s;
      &:hover { background: rgba(248,113,113,0.25); }
    }

    /* Modal */
    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,0.7);
      display: flex; align-items: center; justify-content: center;
      z-index: 1000; backdrop-filter: blur(4px);
    }
    .modal {
      background: var(--bg-card); border: 1px solid var(--border);
      border-radius: var(--radius-lg); padding: 32px; width: 420px; max-width: 90vw;
      box-shadow: 0 20px 60px rgba(0,0,0,0.5);
      h3 { font-size: 1.15rem; font-weight: 700; margin-bottom: 10px; }
      p { color: var(--text-secondary); font-size: 0.875rem; margin-bottom: 18px; line-height: 1.5; }
      input { margin-bottom: 20px; }
    }
    .modal-actions { display: flex; gap: 10px; }
    .btn-danger-confirm {
      flex: 1; background: #dc2626; color: #fff; font-weight: 600;
      padding: 11px; border-radius: var(--radius); font-size: 0.875rem;
      transition: opacity 0.2s;
      &:disabled { opacity: 0.45; cursor: not-allowed; }
      &:hover:not(:disabled) { opacity: 0.85; }
    }
  `],
})
export class ProfileComponent implements OnInit {
  displayName = '';
  bio = '';
  currentPwd = '';
  newPwd = '';
  pwdError = '';
  changingPwd = false;
  successMsg = '';
  showDeleteModal = false;
  deleteConfirm = '';

  get initials(): string {
    const user = this.auth.currentUser();
    const name = user?.displayName || user?.username || '?';
    return name.slice(0, 2).toUpperCase();
  }

  get progress() { return this.learning.getProgress(); }
  get progressPct(): number {
    const p = this.progress;
    return p.total > 0 ? Math.round((p.mastered / p.total) * 100) : 0;
  }
  get favCount(): number {
    return this.learning.vocabulary().filter(w => w.isFavorited).length;
  }

  constructor(public auth: AuthService, public learning: LearningService) {}

  ngOnInit(): void {
    const user = this.auth.currentUser();
    if (user) {
      this.displayName = user.displayName || user.username;
      this.bio = user.bio || '';
    }
  }

  // Click event #11: Save profile → API request
  saveProfile(): void {
    this.successMsg = '';
    this.auth.updateProfile({ displayName: this.displayName, bio: this.bio }).subscribe({
      next: () => {
        this.successMsg = 'Profile updated successfully!';
        setTimeout(() => (this.successMsg = ''), 3000);
      },
      error: () => {},
    });
  }

  // Click event #12: Change password → API request
  changePassword(): void {
    this.pwdError = '';
    if (!this.currentPwd) { this.pwdError = 'Enter current password.'; return; }
    if (this.newPwd.length < 8) { this.pwdError = 'New password must be at least 8 characters.'; return; }

    this.changingPwd = true;
    this.auth.changePassword(this.currentPwd, this.newPwd).subscribe({
      next: () => {
        this.changingPwd = false;
        this.currentPwd = '';
        this.newPwd = '';
        this.successMsg = 'Password changed successfully!';
        setTimeout(() => (this.successMsg = ''), 3000);
      },
      error: () => {
        this.changingPwd = false;
        this.pwdError = 'Failed to change password. Check your current password.';
      },
    });
  }

  confirmDelete(): void {
    this.showDeleteModal = true;
  }

  deleteAccount(): void {
    if (this.deleteConfirm !== this.auth.currentUser()?.username) return;
    this.auth.logout();
  }
}
