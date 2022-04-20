import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class InterceptorService implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err) => {
        if (err.error.statusCode !== 401)
          this.snackBar.open(err.error.message, 'Ошибка ' + err.error.statusCode, {
            duration: 5000,
            panelClass: 'errorSnack',
            horizontalPosition: 'right',
            verticalPosition: 'top',
          });
        return throwError(err);
      }),
    );
  }
}
