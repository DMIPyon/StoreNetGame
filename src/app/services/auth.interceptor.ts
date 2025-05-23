import { inject } from '@angular/core';
import { HttpEvent, HttpHandlerFn, HttpInterceptorFn, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { ToastService } from './toast.service';

export const AuthInterceptor: HttpInterceptorFn = (req: HttpRequest<any>, next: HttpHandlerFn): Observable<HttpEvent<any>> => {
  const authService = inject(AuthService);
  const toastService = inject(ToastService);
  const token = authService.token;
  // console.log('INTERCEPTOR ejecutado. Token:', token);
  if (token) {
    const authReq = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
    return next(authReq).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status >= 400 && error.status < 600) {
          toastService.showError(error.error?.message || 'Error de red o del servidor');
        }
        return throwError(() => error);
      })
    );
  }
  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status >= 400 && error.status < 600) {
        toastService.showError(error.error?.message || 'Error de red o del servidor');
      }
      return throwError(() => error);
    })
  );
}; 