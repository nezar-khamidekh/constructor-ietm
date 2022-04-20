import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({ providedIn: 'root' })
export class InterceptorService implements HttpInterceptor {
  constructor(private snackBar: MatSnackBar) {}

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(req).pipe(
      catchError((err) => {
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
