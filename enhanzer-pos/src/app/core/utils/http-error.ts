import { HttpErrorResponse } from '@angular/common/http';

/** Turns any HTTP failure into a message that is safe to show to the user. */
export function toErrorMessage(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'Cannot reach the server. Check your connection and try again.';
    const body = err.error;
    if (body?.detail) return body.detail;
    if (body?.errors) return Object.values<string[]>(body.errors).flat().join(' ');
    if (body?.title) return body.title;
  }
  return fallback;
}
