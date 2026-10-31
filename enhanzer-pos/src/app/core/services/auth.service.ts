import { HttpClient } from '@angular/common/http';
import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { environment } from '../../../environments/environment';
import { LoginRequest, LoginResponse } from '../models/auth.model';

const SESSION_KEY = 'enhanzer.session';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly _session = signal<LoginResponse | null>(this.restore());

  readonly session = this._session.asReadonly();

  login(request: LoginRequest) {
    return this.http.post<LoginResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
      tap((res) => {
        sessionStorage.setItem(SESSION_KEY, JSON.stringify(res)); // cleared when the tab closes
        this._session.set(res);
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(SESSION_KEY);
    this._session.set(null);
    this.router.navigate(['/login']);
  }

  get token(): string | null {
    return this._session()?.token ?? null;
  }

  isLoggedIn(): boolean {
    const s = this._session();
    return !!s && new Date(s.expiresAtUtc).getTime() > Date.now();
  }

  private restore(): LoginResponse | null {
    try {
      const raw = sessionStorage.getItem(SESSION_KEY);
      return raw ? (JSON.parse(raw) as LoginResponse) : null;
    } catch {
      return null;
    }
  }
}
