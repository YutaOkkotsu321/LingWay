import { Injectable, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, catchError, tap, throwError, of } from 'rxjs';
import {
  AuthTokens, LoginRequest, RegisterRequest, User, UpdateProfileRequest
} from '../core/models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly API = 'http://localhost:8000/api';

  currentUser = signal<User | null>(this.loadUser());
  isLoading   = signal(false);
  authError   = signal<string | null>(null);

  constructor(private http: HttpClient, private router: Router) {}

  // ── LOGIN ────────────────────────────────────────────────────────────
  login(credentials: LoginRequest): Observable<AuthTokens> {
    this.isLoading.set(true);
    this.authError.set(null);

    return this.http.post<AuthTokens>(`${this.API}/auth/login/`, credentials).pipe(
      tap((tokens) => {
        localStorage.setItem('access_token', tokens.access);
        localStorage.setItem('refresh_token', tokens.refresh);
        // Fetch current user profile
        this.fetchProfile().subscribe();
        this.isLoading.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const msg = err.error?.detail || err.error?.message || 'Login failed. Check your credentials.';
        this.authError.set(msg);

        // ── MOCK FALLBACK (remove when backend is ready) ──
        if (err.status === 0 || err.status === 404) {
          const mockTokens: AuthTokens = { access: 'mock-access-token', refresh: 'mock-refresh-token' };
          const mockUser: User = { id: 1, username: credentials.username, email: `${credentials.username}@example.com`, displayName: credentials.username };
          localStorage.setItem('access_token', mockTokens.access);
          localStorage.setItem('refresh_token', mockTokens.refresh);
          localStorage.setItem('user', JSON.stringify(mockUser));
          this.currentUser.set(mockUser);
          this.authError.set(null);
          this.isLoading.set(false);
          return of(mockTokens);
        }

        return throwError(() => err);
      })
    );
  }

  // ── REGISTER ─────────────────────────────────────────────────────────
  register(data: RegisterRequest): Observable<User> {
    this.isLoading.set(true);
    this.authError.set(null);

    return this.http.post<User>(`${this.API}/auth/register/`, data).pipe(
      tap((user) => {
        this.isLoading.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        const msg = err.error?.username?.[0] || err.error?.email?.[0] || err.error?.detail || 'Registration failed. Please try again.';
        this.authError.set(msg);

        // ── MOCK FALLBACK ──
        if (err.status === 0 || err.status === 404) {
          const mockUser: User = { id: 1, username: data.username, email: data.email, displayName: data.username };
          this.authError.set(null);
          this.isLoading.set(false);
          return of(mockUser);
        }

        return throwError(() => err);
      })
    );
  }

  // ── LOGOUT ────────────────────────────────────────────────────────────
  logout(): void {
    const refreshToken = localStorage.getItem('refresh_token');

    // Notify backend (click event #3 — triggers API)
    this.http.post(`${this.API}/auth/logout/`, { refresh: refreshToken }).pipe(
      catchError(() => of(null))
    ).subscribe();

    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    this.currentUser.set(null);
    this.router.navigate(['/login']);
  }

  // ── GET PROFILE ───────────────────────────────────────────────────────
  fetchProfile(): Observable<User> {
    return this.http.get<User>(`${this.API}/auth/me/`).pipe(
      tap((user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.set(user);
      }),
      catchError((err) => {
        const stored = this.loadUser();
        if (stored) this.currentUser.set(stored);
        return of(stored as User);
      })
    );
  }

  // ── UPDATE PROFILE ────────────────────────────────────────────────────
  updateProfile(data: UpdateProfileRequest): Observable<User> {
    this.isLoading.set(true);
    this.authError.set(null);

    return this.http.patch<User>(`${this.API}/auth/me/`, data).pipe(
      tap((user) => {
        localStorage.setItem('user', JSON.stringify(user));
        this.currentUser.set(user);
        this.isLoading.set(false);
      }),
      catchError((err: HttpErrorResponse) => {
        this.isLoading.set(false);
        this.authError.set('Failed to update profile. Please try again.');

        // ── MOCK FALLBACK ──
        if (err.status === 0 || err.status === 404) {
          const updated = { ...this.currentUser()!, ...data };
          localStorage.setItem('user', JSON.stringify(updated));
          this.currentUser.set(updated);
          this.authError.set(null);
          this.isLoading.set(false);
          return of(updated);
        }

        return throwError(() => err);
      })
    );
  }

  // ── REFRESH TOKEN ─────────────────────────────────────────────────────
  refreshToken(): Observable<{ access: string }> {
    const refresh = localStorage.getItem('refresh_token');
    return this.http.post<{ access: string }>(`${this.API}/auth/token/refresh/`, { refresh }).pipe(
      tap((res) => localStorage.setItem('access_token', res.access)),
      catchError((err) => {
        this.logout();
        return throwError(() => err);
      })
    );
  }

  // ── CHANGE PASSWORD ───────────────────────────────────────────────────
  changePassword(oldPassword: string, newPassword: string): Observable<void> {
    return this.http.post<void>(`${this.API}/auth/change-password/`, {
      old_password: oldPassword,
      new_password: newPassword,
    }).pipe(
      catchError((err: HttpErrorResponse) => {
        if (err.status === 0 || err.status === 404) {
          return of(undefined as unknown as void);
        }
        return throwError(() => err);
      })
    );
  }

  isLoggedIn(): boolean {
    return !!localStorage.getItem('access_token');
  }

  private loadUser(): User | null {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }
}
