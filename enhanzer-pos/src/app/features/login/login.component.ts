import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { finalize } from 'rxjs';
import { AuthService } from '../../core/services/auth.service';
import { toErrorMessage } from '../../core/utils/http-error';
import { FieldErrorComponent } from '../../shared/components/field-error.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, FieldErrorComponent],
  template: `
    <main class="page">
      <form class="card" [formGroup]="form" (ngSubmit)="submit()" novalidate>
        <h1>Hi</h1>

        @if (error(); as msg) { <div class="alert" role="alert">{{ msg }}</div> }

        <div class="field">
          <div class="row">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg>
            <input type="email" formControlName="email" placeholder="Email*" autocomplete="username" />
          </div>
          <app-field-error [control]="form.controls.email" label="Email" />
        </div>

        <div class="field">
          <div class="row">
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="8" cy="12" r="3.5"/><path d="M11.5 12H21M18 12v3M15 12v2"/></svg>
            <input [type]="showPassword() ? 'text' : 'password'" formControlName="password" placeholder="Password*" autocomplete="current-password" />
            <button type="button" class="eye" (click)="showPassword.set(!showPassword())"
                    [attr.aria-label]="showPassword() ? 'Hide password' : 'Show password'">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 12s3.5-6 10-6 10 6 10 6-3.5 6-10 6S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>@if (!showPassword()) { <path d="M3 3l18 18"/> }</svg>
            </button>
          </div>
          <app-field-error [control]="form.controls.password" label="Password" />
        </div>

        <button class="login" type="submit" [disabled]="loading()">
          @if (loading()) { <span class="spinner"></span> Signing in... } @else { LOGIN }
        </button>
      </form>
    </main>
  `,
  styles: `
    .page { min-height: 100vh; display: grid; place-items: center; padding: 16px; }
    .card { width: 100%; max-width: 340px; background: #fff; padding: 32px 28px; border-radius: 12px; box-shadow: 0 8px 30px rgb(30 50 90 / .1); }
    h1 { text-align: center; font-size: 18px; font-weight: 600; color: #5b6475; margin: 0 0 20px; }
    .field { margin-bottom: 18px; }
    .row { display: flex; align-items: center; gap: 8px; border-bottom: 1px solid var(--border); color: var(--muted); }
    .row:focus-within { border-color: var(--blue); color: var(--blue); }
    input { flex: 1; border: 0; outline: 0; padding: 8px 0; font: inherit; font-size: 13px; color: var(--text); background: transparent; }
    .eye { border: 0; background: none; color: var(--muted); padding: 2px; }
    .alert { background: #fdecea; color: var(--danger); border-radius: 6px; padding: 10px 12px; font-size: 13px; margin-bottom: 16px; }
    .login { width: 100%; margin-top: 8px; padding: 10px; border: 0; border-radius: 4px; color: #fff; font-size: 13px; letter-spacing: .5px; background: linear-gradient(90deg, #7cc8ff, #5f5aa2); }
    .login:disabled { opacity: .7; cursor: not-allowed; }
  `,
})
export class LoginComponent {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  readonly form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly showPassword = signal(false);

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.error.set(null);
    this.auth.login(this.form.getRawValue())
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: () => this.router.navigate(['/purchase-bill']),
        error: (err) => this.error.set(toErrorMessage(err, 'Login failed. Please check your credentials.')),
      });
  }
}
