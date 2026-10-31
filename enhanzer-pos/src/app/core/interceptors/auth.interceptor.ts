import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AuthService } from '../services/auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const isApi = req.url.startsWith(environment.apiUrl);
  const isLogin = req.url.endsWith('/auth/login');

  const outgoing = isApi && auth.token ? req.clone({ setHeaders: { Authorization: `Bearer ${auth.token}` } }) : req;

  return next(outgoing).pipe(
    catchError((err: unknown) => {
      // expired / invalid token -> force re-login (but not for failed login attempts)
      if (err instanceof HttpErrorResponse && err.status === 401 && isApi && !isLogin) auth.logout();
      return throwError(() => err);
    }),
  );
};
