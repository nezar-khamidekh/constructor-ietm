import { Location } from '@angular/common';
import { Injectable } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { AuthService } from 'src/app/auth/services/auth.service';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<boolean> {
    return this.authService.isAuthenticated().pipe(
      map((isAuthenticated: boolean) => {
        if (state.url.startsWith('/auth')) {
          this.router.navigate(['/main']);
          return false;
        }
        return true;
      }),
      catchError((err) => {
        console.log(err);
        if (state.url.startsWith('/auth')) {
          return of(true);
        } else {
          this.router.navigate(['/repositories']);
          return of(false);
        }
      }),
    );
  }
}
